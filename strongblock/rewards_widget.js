// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: hand-holding-usd;
/**
 **  StrongBlock Rewards Widget
 **  iOS Scriptable Widget to see StrongBlock Rewards. (Updated for STRONGER)
 **  Shows Wallets' STRONGER balance, Node Rewards and the sum of both with the USD value.
 **
 **  NOTE: THIS WAS MADE ON THE IPHONE 13 PRO MAX, SMALLER PHONES MAY EXPERIENCE PROBLEMS
 **        No updates will be able to be made for a couple of weeks sadly.
 **  I did put the font size of the rewards amount at the top of the script, you can decrease it if you experience problems.
 **
 **    Made by Vincentt (https://github.com/Vincentt1705)
 **
 **  For instructions see https://github.com/Vincentt1705/scriptable-widgets/tree/main/strongblock
 **  Preview image: https://imgur.com/a/ua9caqB
 **/

// Add your wallet(s) here. Make sure that you have [" and "] surrounding your wallet address.
// If you have multiple put them within the brackets with a comma separating the strings; ["wallet1", "wallet2"]
const wallets = ["REPLACE_WITH_YOUR_WALLET"]

// You can decrease the size of some fonts if they're not showing properly (QUICK FIX TO MAKE WIDGET USABLE ON SMALLER PHONES)
const rewardsNumberSize = 26 // Standard: 26
const smallTexts = 10 // Standard: 10
// Can change this text to "Strong" or "" if "StrongBlock" doesn't fit
const strongHeaderText = "StrongBlock" // Standard: "StrongBlock"


// Collect data
let strongblockLogoUrl
let strngrPrice
let strngrRewards = 0
let strngrWalletBal = 0
await collectData()

// Create widget
let widget = new ListWidget()
widget.setPadding(16, 16, 12, 16)
setGradientBackground()
await addHeader()
addMainContent()

// Finish script run
if (config.runsInWidget) {
    Script.setWidget(widget)
} else {
    widget.presentSmall()
}
Script.complete()

async function collectData() {
    const protocolBaseUrl = "https://openapi.debank.com/v1/user/protocol"
    for (let wallet of wallets) {
        // NODE REWARDS
        const rewardsReq = new Request(`${protocolBaseUrl}?id=${wallet}&protocol_id=strongblock`)
        const rewardsData = await rewardsReq.loadJSON()

        // For each type of node (e.g. Ethereum, Polygon) add rewards from pool
        for (let {detail} of rewardsData["portfolio_item_list"]) {
            strngrRewards += detail['supply_token_list'][0]['amount']
        }

        // Save StrongBlock logo url
        strongblockLogoUrl = rewardsData["logo_url"]

        // WALLET BALANCE
        const balanceReq = new Request(`https://openapi.debank.com/v1/user/token?id=${wallet}&chain_id=eth&token_id=0xdc0327d50e6c73db2f8117760592c8bbf1cdcf38`)
        const balanceData = await balanceReq.loadJSON()
        strngrPrice = balanceData["price"]
        strngrWalletBal += balanceData["amount"]
    }
}

function setGradientBackground() {
    let gradient = new LinearGradient()
    gradient.colors = [new Color('#181818'), new Color('#222222'), new Color('#181818')]
    gradient.locations = [0, 0.5, 1]
    widget.backgroundGradient = gradient
}

async function addHeader() {
    // Create stack for layout
    const headerStack = widget.addStack()
    headerStack.centerAlignContent()
    headerStack.spacing = 4
    headerStack.setPadding(0, 0, 0, 0)

    // Add Strongblock logo
    const logoImage = await (new Request(strongblockLogoUrl)).loadImage()
    let strongIcon = headerStack.addImage(logoImage)
    strongIcon.imageSize = new Size(24, 24)

    // Add title
    const title = headerStack.addText(strongHeaderText)
    title.font = Font.semiboldMonospacedSystemFont(16)

    // Place flexible spacer on the right so everything is pushed left
    headerStack.addSpacer()
}

function addMainContent() {
    // Create a space below the header
    widget.addSpacer(8)
    addWalletBalance()
    // Add spacer between wallet and rewards balance
    widget.addSpacer(7)
    addRewardsBalance()
    // Use a spacer to push the `total` stack more down
    widget.addSpacer(1)
    addTotals()

    function addWalletBalance() {
        // Create horizontal stack
        const walletBalStack = widget.addStack() // >;)
        walletBalStack.bottomAlignContent()
        walletBalStack.setPadding(0, 0, 0, 0)

        // Push everything to the right
        walletBalStack.addSpacer()

        // Create vertical stack to push the text a little bit up
        const walletTextStack = walletBalStack.addStack()
        walletTextStack.layoutVertically()
        walletTextStack.setPadding(0, 0, 0, 0)

            const walletText = walletTextStack.addText("WALLET")
            walletText.textColor = Color.darkGray()
            walletText.font = Font.regularMonospacedSystemFont(smallTexts)
            // Add the spacer below the text to push it up
            walletTextStack.addSpacer(2)

        // Space the text and amount apart
        walletBalStack.addSpacer(4)

        let decimals
        if (strngrWalletBal > 99.99) {decimals = 1} else {decimals = 2}
        const walletAmt = walletBalStack.addText(`${strngrWalletBal.toFixed(decimals)}`)
        walletAmt.textColor = Color.darkGray()
        walletAmt.font = Font.regularMonospacedSystemFont(18)
    }

    function addRewardsBalance() {
        // Create horizontal stack
        const rewardsStack = widget.addStack()
        rewardsStack.bottomAlignContent()
        rewardsStack.setPadding(0, 0, 0, 0)

        // Push everything to the right
        rewardsStack.addSpacer()

        // Create vertical stack to push the text a little bit up
        const rewardsTextStack = rewardsStack.addStack()
        rewardsTextStack.layoutVertically()
        rewardsTextStack.setPadding(0, 0, 0, 0)

            const rewardsText = rewardsTextStack.addText("REWARDS")
            rewardsText.font = Font.regularMonospacedSystemFont(smallTexts)
            // Add the spacer below the text to push it up
            rewardsTextStack.addSpacer(4)

        // Space the text and amount apart
        rewardsStack.addSpacer(4)

        // If we get into the 100+ STRONGER, then only show 1 decimal
        let decimals
        if (strngrRewards > 99.99) {decimals = 1} else {decimals = 2}
        const rewardsAmt = rewardsStack.addText(`${strngrRewards.toFixed(decimals)}`)
        rewardsAmt.font = Font.semiboldMonospacedSystemFont(rewardsNumberSize)
    }

    function addTotals() {
        // Create horizontal main stack
        const totalStack = widget.addStack()
        totalStack.layoutHorizontally()
        totalStack.setPadding(0, 0, 0, 0)

        // Content
        totalStack.addSpacer() // Push everything to the right
        addLeftSide() // Left side only has the 'Total' text
        totalStack.addSpacer(8) // Space between left side and right side
        addRightSide() // Right side has total amount of STRNGR and the USD value of it

        function addLeftSide() {
            // Create vertical stack
            const leftStack = totalStack.addStack()
            leftStack.layoutVertically()
            leftStack.setPadding(0, 0, 0, 0)

            leftStack.addSpacer() // Center content vertically
            const totalText = leftStack.addText("Total")
            if (strongHeaderText !== "StrongBlock") {
                totalText.font = Font.regularMonospacedSystemFont(12)
            } else {
                totalText.font = Font.regularMonospacedSystemFont(10)
            }

            totalText.textColor = Color.gray()
            leftStack.addSpacer() // Center content vertically
        }

        function addRightSide() {
            // Create vertical stack to place STRNGR and USD values above each other
            const rightStack = totalStack.addStack()
            rightStack.layoutVertically()
            rightStack.setPadding(0, 0, 0, 0)
            rightStack.spacing = 4

            // Calculate totals
            const strngrTotal = strngrRewards + strngrWalletBal
            const usdValue = strngrTotal * strngrPrice

            // Place the totals in the widget
            addStrngrTotal()
            addUsdTotal()

            function addStrngrTotal() {
                // Create horizontal stack to put the text and amount besides each other
                const strngrStack = rightStack.addStack()
                strngrStack.setPadding(0, 0, 0, 0)
                strngrStack.layoutHorizontally()

                // Create vertical stack to set the height of the text
                const strngrTextStack = strngrStack.addStack()
                strngrTextStack.layoutVertically()
                strngrTextStack.setPadding(0, 0, 0, 0)

                    // Add a spacer on top to push the text down
                    strngrTextStack.addSpacer()
                    const strngrText = strngrTextStack.addText("STRNGR")
                    strngrText.textColor = Color.darkGray()
                    strngrText.font = Font.lightMonospacedSystemFont(smallTexts)

                // This spacer is in the horizontal stack, from inbetween it pushes the text and amount to the sides
                strngrStack.addSpacer()

                // Create vertical stack to set the height of the amount
                const strngrAmtStack = strngrStack.addStack()
                strngrAmtStack.layoutVertically()
                strngrAmtStack.setPadding(0, 0, 0, 0)

                    // Add a spacer on top to push the amount down
                    strngrAmtStack.addSpacer()
                    let decimals
                    if (strngrTotal > 99.99) {decimals = 1} else {decimals = 2}
                    const strngrAmt = strngrAmtStack.addText(strngrTotal.toFixed(decimals))
                    strngrAmt.textColor = Color.gray()
                    strngrAmt.font = Font.lightMonospacedSystemFont(12)
            }

            function addUsdTotal() {
                // Create horizontal stack to put the text and amount besides each other
                const usdStack = rightStack.addStack()
                usdStack.setPadding(0, 0, 0, 0)
                usdStack.layoutHorizontally()

                // Create vertical stack to set the height of the text
                const bottomTextStack = usdStack.addStack()
                bottomTextStack.layoutVertically()
                bottomTextStack.setPadding(0, 0, 0, 0)

                    const valueText = bottomTextStack.addText("USD")
                    valueText.textColor = Color.darkGray()
                    valueText.font = Font.lightMonospacedSystemFont(smallTexts)
                    // Add a spacer below to push the text up
                    bottomTextStack.addSpacer()

                // This spacer is in the horizontal stack, from inbetween it pushes the text and amount to the sides
                usdStack.addSpacer()

                // Create vertical stack to set the height of the text
                const bottomAmtStack = usdStack.addStack()
                bottomAmtStack.layoutVertically()
                bottomAmtStack.setPadding(0, 0, 0, 0)

                    // If we get above the 10k+ USD, then stop showing cents (decimals)
                    let decimals
                    if (usdValue > 9999.99) {decimals = 0} else {decimals = 2}
                    // Places commas (,) in the string for readability
                    valueAmt = bottomAmtStack.addText("$" + usdValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
                    valueAmt.textColor = Color.gray()
                    valueAmt.font = Font.lightMonospacedSystemFont(12)
                    // Add a spacer below to push the text up
                    bottomAmtStack.addSpacer()
            }
        }
    }
}
