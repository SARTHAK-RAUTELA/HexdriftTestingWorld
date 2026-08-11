0:00 Hey team, here's a video to run through what we're doing for Test 257 because, ah, there's a little bit of detail here.
0:10 So, first of all, we're going to show an offer to those people that have added a product to CART. They go through to the checkout page on Shopify and decide not to buy, but instead return back to the site.
0:24 We want to target that cohort of people that have not purchased and land back on the site. The reason we're doing that is previously we fired a hot jar survey to that same audience which discovered that a lot of people are getting to the checkout page and discovering the price was higher than they expected
0:43 due to things like taxes and delivery costs. So what we're going to do in the test is we are going to, probably you'll need two activities in Convert.
0:56 One will be to trigger the experiment and another one will be to actually show the changes. So we want to trigger the modal only on these conditions.
1:03 If someone has visited the checkout page, that's the Shopify, and then return to the website, that's the same triggering that we used to fire the Hotjar survey a few weeks ago.
1:15 So maybe you can repurpose that code. But we also want to fire the test when they have a single WinkBed mattress in the cart, and by WinkBed mattress what I mean is the one that you get when you go to the shop WinkBed page.
1:36 So basically, the WinkBed. There are other mattresses, the GravityLux and the EcoCloud. We're not going to include those, it needs to be a WinkBed.
1:45 So they land back and they have a, have one WinkBed mattress in their cart. Not two or three or four.
1:54 And then that mattress does not have a cooling cover. So in other words, the product they've added does not have this frost cooling fabric.
2:05 So it'll be without that. See how the price goes up? It goes up $125. So it could be any firmness level, it could be any size, it just can't have the frost cooling cover, and we're also not going to trigger the test if there's two or more mattresses in the cart because those are outliers and will increase
2:23 the complexity. If someone meets all of these conditions, then five seconds after they return to the website, we want to trigger the test.
2:32 So we probably want some activity and convert to check for all of these things, and if so, we trigger the test.
2:39 The test is this one. It's modal. It'll appear on any page on the site. Uh, we want the background to go dark, uh, and then note they modal itself has a slight background color and some icons and some shading effects.
2:52 The copy is exactly as you see here. If you click outside the modal, you'll dismiss it. If you click the close icon, you'll dismiss it.
2:58 However, if you click this red button, we need to do a couple of things. We want to, first of all, swap out the mattress that is in their cart.
3:09 So, there will be a number of different possible configurations. The mattress could be any one of these firmness levels, in combination with any one of these sizes.
3:18 So, let's say there's six sizes and four firmness levels, so there could be 24 different combinations. We want to swap out the mattress for the equivalent size of the mattress and firmness level, but with the upgraded fabric, the cooling fabric applied.
3:36 So if you think there's four firmness levels and six sizes, 24 different SKUs, there'll be another 24 of those same mattress with the firmness fabric applied, because this is not a standalone product.
3:48 This is actually built into the mattress. So it makes another 24. So we basically want to determine, okay, someone chose a soft king.
3:57 That's what we've detected. We're going to remove that from the current card. And then we're going to add a soft king with the cooling fabric applied into the card.
4:07 So we've done tests like this before where we remove products from cart and add them in. So what we want to do is if someone clicks this button, we're going to do that swap out.
4:16 And we'll need to display that and maybe some kind of icon to show that things are loading like a spinner.
4:21 And then once we're confident that that change has been applied, we're going to send them directly to the checkout page on Shopify, but we're going to send them to using this, um, link here.
4:33 And you can see here it's got a query parameter and that's going to apply a discount code of $125, which will basically discount the cost of this fabric by that $125 back to what the original price was.
4:49 So basically, they're getting an upgrade to the cooling fabric for free. So that's the test, uhm, obviously there's a little bit of detail in here, ah, we'll need to test it a lot to make sure it works correctly, but if you have any questions, ah, let me know.
5:03 If you have any improvements, let me know. But otherwise, I look forward to seeing this one. Thank you.