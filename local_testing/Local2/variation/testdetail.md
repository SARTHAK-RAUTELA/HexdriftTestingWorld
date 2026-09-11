test name: The Swiftest - SWF143 - Pet Insurance - Pricing V2




URL targeting (Pet Insurance Gurus)

https://petinsurancegurus.com/

https://petinsurancegurus.com/home/

https://petinsurancegurus.com/comparison/

https://petinsurancegurus.com/compare/




Audience targeting

All users
desktop mobile both


check on browser: main: chrome safari
edge firefox



Variations destails:

This test reduces the published prices for all listings across the site, except if the user has selected a specific breed:

Variation 1: Reduce prices by 13.5% (Mid-size, mixed breed)

Variation 2: Reduce prices by 32.9% (Small, mixed breed)




additional informtion:

Applies to all views e.g. default, Dogs, Cats, ZIP Code, combinations etc.

Also applies to listings 8, 9 and 10 hidden within the “Show More” accordion

Only time we do not apply the discount is if the user has selected a breed (in which case we make no changes)

Please reduce flashing as much as possible

Base on the hardcoded version of prices (these may be changing soon, so code this test so that the discount is applied dynamically to whatever price is currently displaying)

Note that SWF111 and SWF116 deploys are currently running, but will be paused by the time this test launches





preivew link:

control: https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257165
v1: https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257166
v2: https://petinsurancegurus.com/?utm_campaign=Cro143mode&_conv_eforce=100052764.1000257167



more detials:

There is no custom trigger or custom goal required for this test.

Correct, but try to reduce flashing.

For both V1 and V2, we need to update the prices based on the discount percentages you shared.

Correct.

The changes should only apply when a user opens the targeted URL and no specific breed is selected.

Correct.

The discounted prices should apply across all combinations, including Dogs, Cats, ZIP Code, and other filter combinations. The changes should also apply to the additional listings shown after clicking the "See More" button. However, if a specific breed is selected, we should revert to the original prices.

Correct.

Both SWF111 and SWF116 will be paused while this test is running.

Correct.

One use case we would like to confirm: if a user selects a specific breed and then changes the selection back to the "All Breeds" option, should we apply the discounted prices again?

Yes.

Also, please confirm whether we need to include or exclude any Google Audiences for this test.

No.

