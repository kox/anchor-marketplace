/* use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::TransferChecked, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::state::{ Listing, Marketplace };


#[derive(Accounts)]
pub struct Delist<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [b"marketplace", marketplace.name.as_str().as_bytes()],
        bump = marketplace.bump
    )]
    pub marketplace: Box<Account<'info, Marketplace>>,

    maker_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::authority = payer,
        associated_token::mint = marker_mint,
    )]
    maker_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = payer,
        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()],
        bump = listing.bump,
    )]
    listing: Box<Account<'info, Listing>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = maker_mint,
        associated_token::authority = payer,
    )]
    vault: Box<InterfaceAccount<'info, TokenAccount>>,


    associated_token_program: Program<'info, AssociatedToken>,
    token_program: Program<'info, TokenInterface>,
    system_program: Program<'info, System>,
}

impl<'info> Delist<'info> {
    pub fn withdraw_nft(&mut self) -> Result<()> {
        let seeds = ...self.withdraw_nft()
        let signer...

        let account = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.maker_ata.to_account_info(),
            authority: self.listing.to_account_info(),
            mint: self.maker_mint.to_account_info()
        };

        let cpi_ctx = CptContext::new_with_signer(self..) {

        };

        Ok(())
    }
} */