/* use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, metadata::{MasterEditionAccount, MetadataAccount}, token::{spl_token::instruction::transfer_checked, TransferChecked}, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::state::{Listing, Marketplace};

#[derive(Accounts)]
pub struct List<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [b"marketplace", marketplace.name.as_str().as_bytes()],
        bump = marketplace.bump
    )]
    pub marketplace: Box<Account<'info, Marketplace>>,

    maker_mint: Box<InterfaceAccount<'info, Mint>>,

    collection_mint: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::authority = payer,
        associated_token::mint = marker_mint,
    )]
    maker_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        space = Listing::INIT_SPACE,
        seeds = [marketplace.key().as_ref(), maker_mint],
        bump,
    )]
    listing: Box<Account<'info, Listing>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = maker_mint,
        associated_token::authority = payer,
    )]
    vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        seeds = [
            b"medatada",
            metadata_program.key().as_ref(),
            master_mint.key().as_ref(),
            b"edition"
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    master_edition: Box<Account<'info, MasterEditionAccount>>,

    metadata: Box<Account<'info, MetadataAccount>>,

    associated_token_program: Program<'info, AssociatedToken>,
    token_program: Program<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

impl<'info> List<'info> {
    pub fn create_listing(&mut self, price: u64, bumps: &ListBumps) -> Result<()>  {
        self.listing.set_inner(Listing {
            maker: self.payer.to_account_info(),
            mint: self.maker_mint,
            price,
            bump: bumps.listing,
        });

        Ok(())
    }

    pub fn deposit_nft(&mut self) -> Result<()> {
        let account = TransferChecked {
            from: self.maker_ata.to_account_info(),
            mint: self.maker_mint.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.payer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            token_program, 
            account
        );

        transfer_checked(
            cpi_ctx, 
            account,
        );
        
        Ok(())
    }
}

 */