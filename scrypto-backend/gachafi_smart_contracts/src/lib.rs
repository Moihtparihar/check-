use scrypto::prelude::*;

#[blueprint]
mod badge_contract {
    struct BadgeContract {
        // Vault holding the minted badges
        badge_vault: Vault,
    }

    impl BadgeContract {
        pub fn new() -> Global<BadgeContract> {
            // Mint a new fungible "badge" with no divisibility
            let badge_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .metadata(metadata! {
                    init {
                        "name" => "GachaFi Badge", locked;
                    }
                })
                .divisibility(DIVISIBILITY_NONE)
                .mint_initial_supply(dec!(100));

            Self {
                badge_vault: Vault::with_bucket(badge_bucket.into()),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        // Dispense one badge
        pub fn get_badge(&mut self) -> Bucket {
            self.badge_vault.take(dec!(1))
        }
    }
}
