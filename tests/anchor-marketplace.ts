import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  // TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

import { AnchorMarketplace } from "../target/types/anchor_marketplace";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


describe("anchor-marketplace", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const connection = provider.connection;

  const program = anchor.workspace.AnchorMarketplace as Program<AnchorMarketplace>;

  // Let's use the TOKEN_2022 program which is a bit more advanced than basic spl
  const tokenProgram = TOKEN_2022_PROGRAM_ID;

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  // We will generate a few different keypair to test the program 
  // The roles are:
  // - admin: Person who initialize the marketplace
  // - creator: Person who created the token
  // - seller: Person who owns a token and wants to sell it in the marketplace
  // - buyer: Person who wants to purchase the token listed in the marketplace
  const [admin, creator, seller, buyer, mintA] = Array.from({ length: 2 }, () =>
    Keypair.generate()
  );

  // defining accounts
  // Based on seller and buyer keypairs and mintA pubkeys, we can know the deterministic ATAs
  const [buyerAta, sellerAta] = [maker, taker]
    .map((a) =>
      [mintA].map((m) =>
        getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram)
      )
    )
    .flat();


  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });


});
/* 


  // We will generate a few different keypair to test the program 
  const [maker, taker, mintA, mintB] = Array.from({ length: 4 }, () =>
    Keypair.generate()
  );

  // Based on maker and taker keypairs and mintA and mintB pubkeys, we can know the deterministic ATAs
  const [makerAtaA, makerAtaB, takerAtaA, takerAtaB] = [maker, taker]
    .map((a) =>
      [mintA, mintB].map((m) =>
        getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, tokenProgram)
      )
    )
    .flat();

  // Based on the seeds we defined to create the Escrow account, we can find the public key of the PDA address 
  const escrow = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
    program.programId
  )[0];

  // The vault will be a ATA of the mintA and the escrow. 
  const vault = getAssociatedTokenAddressSync(mintA.publicKey, escrow, true, tokenProgram);

  // Accounts
  const accounts = {
    maker: maker.publicKey,
    taker: taker.publicKey,
    mintA: mintA.publicKey,
    mintB: mintB.publicKey,
    makerAtaA,
    makerAtaB,
    takerAtaA,
    takerAtaB,
    escrow,
    vault,
    tokenProgram,
  }

  it("Airdrop and create mints", async () => {
    let lamports = await getMinimumBalanceForRentExemptMint(connection);
    let tx = new Transaction();
    tx.instructions = [
      ...[maker, taker].map((account) =>
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: account.publicKey,
          lamports: 10 * LAMPORTS_PER_SOL,
        })
      ),
      ...[mintA, mintB].map((mint) =>
        SystemProgram.createAccount({
          fromPubkey: provider.publicKey,
          newAccountPubkey: mint.publicKey,

          lamports,
          space: MINT_SIZE,
          programId: tokenProgram,
        })
      ),
      ...[
        { mint: mintA.publicKey, authority: maker.publicKey, ata: makerAtaA },
        { mint: mintB.publicKey, authority: taker.publicKey, ata: takerAtaB },
      ]
        .flatMap((x) => [
          createInitializeMint2Instruction(x.mint, 6, x.authority, null, tokenProgram),
          createAssociatedTokenAccountIdempotentInstruction(provider.publicKey, x.ata, x.authority, x.mint, tokenProgram),
          createMintToInstruction(x.mint, x.ata, x.authority, 1e9, undefined, tokenProgram),
        ])
    ];

    await provider.sendAndConfirm(tx, [mintA, mintB, maker, taker]).then(log);
  });

  it('should start with maker 1000 and taker 1000 each other', async () => {
    let balances = await getTokenBalances({
      makerAtaA,
      takerAtaB,
    });

    assert.equal(balances['makerAtaA'], 1000);
    assert.equal(balances['takerAtaB'], 1000);
  })

  it("should deposit the maker tokens after calling Make", async () => {
    await program.methods
      .make(seed, new BN(1e8), new BN(1e8))
      .accounts({ ...accounts })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);

    await delay(1000);

    const balances = await getTokenBalances({
      makerAtaA,
      takerAtaB,
      vault,
    });

    assert.equal(balances['makerAtaA'], 900);
    assert.equal(balances['takerAtaB'], 1000);
    assert.equal(balances['vault'], 100);
  });

  it('should Refund the tokens to the maker and close the vault', async () => {
    await program.methods
      .refund()
      .accounts({ ...accounts })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);

    const balances = await getTokenBalances({
      makerAtaA,
      takerAtaB,
    });

    assert.equal(balances['makerAtaA'], 1000);
    assert.equal(balances['takerAtaB'], 1000);
    assert.isNull(await connection.getAccountInfo(vault));
  });

  it('should exchange tokens with taker correctly', async () => {
    await program.methods
      .make(seed, new BN(1e8), new BN(1e8))
      .accounts({ ...accounts })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);

    await program.methods
      .take()
      .accounts({ ...accounts })
      .signers([taker])
      .rpc()
      .then(confirm)
      .then(log);

    const balances = await getTokenBalances({
      makerAtaA,
      makerAtaB,
      takerAtaA,
      takerAtaB,
      vault,
    });    

    assert.equal(balances['makerAtaA'], 900);
    assert.equal(balances['makerAtaB'], 100);
    assert.equal(balances['takerAtaA'], 100);
    assert.equal(balances['takerAtaB'], 900);
    assert.isNull(await connection.getAccountInfo(vault));
  })
}); */