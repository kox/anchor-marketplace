use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::{ Marketplace, MarketplaceError };

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = Marketplace::INIT_SPACE,
        seeds = [b"marketplace", name.as_str().as_bytes()],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    /* #[account(
        init,
        seeds = [b"rewards", marketplace.key().as_ref()],
        payer = payer,
        bump,
        mint::decimals = 6,
        mint::authority = marketplace
    )]    
    pub rewards_mint: InterfaceAccount<'info, Mint>, */

    #[account(
        seeds = [b"treasury", marketplace.key().as_ref()],
        bump
    )]
    treasury: SystemAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, name: String, fee: u16, bumps: &InitializeBumps) -> Result<()> {
        require!(name.len() > 0 && name.len() < 33, MarketplaceError::NameTooLong);

        self.marketplace.set_inner(Marketplace {
            admin: self.payer.key(),
            fee,
            name,
            bump: bumps.marketplace,
            treasury_bump: bumps.treasury,
        });

        Ok(())
    }
}