use anchor_lang::prelude::*;

mod contexts;
use contexts::*;

mod state;
pub use state::*;

mod errors;
pub use errors::*;

declare_id!("5viJrG6TQg7W67GTedUmcpEBbCw2pwiFLTaV1q9herG3");


#[program]
pub mod anchor_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, fee: u16) -> Result<()> {
        ctx.accounts.initialize(name, fee, &ctx.bumps)
    }
}
