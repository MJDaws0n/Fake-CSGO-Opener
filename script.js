// Main Application State
let balance = 10000.00;
let selectedCase = null;
let isOpening = false;

// DOM Elements
const caseSelection = document.getElementById('caseSelection');
const caseOpening = document.getElementById('caseOpening');
const casesGrid = document.getElementById('casesGrid');
const balanceDisplay = document.getElementById('balance');
const openCaseButton = document.getElementById('openCaseButton');
const backButton = document.getElementById('backButton');
const selectedCaseImage = document.getElementById('selectedCaseImage');
const selectedCaseName = document.getElementById('selectedCaseName');
const selectedCasePrice = document.getElementById('selectedCasePrice');
const reel = document.getElementById('reel');
const resultDisplay = document.getElementById('resultDisplay');
const resultImage = document.getElementById('resultImage');
const resultName = document.getElementById('resultName');
const resultRarity = document.getElementById('resultRarity');
const resultPrice = document.getElementById('resultPrice');
const openAgainButton = document.getElementById('openAgainButton');
const changeCaseButton = document.getElementById('changeCaseButton');

// Initialize the application
function init() {
    renderCases();
    updateBalanceDisplay();
    setupEventListeners();
}

// Render all cases
function renderCases() {
    casesGrid.innerHTML = '';
    cases.forEach(caseData => {
        const caseCard = createCaseCard(caseData);
        casesGrid.appendChild(caseCard);
    });
}

// Create a case card element
function createCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.innerHTML = `
        <img src="${caseData.image}" alt="${caseData.name}">
        <h3>${caseData.name}</h3>
        <p class="price">$${caseData.price.toFixed(2)}</p>
    `;
    card.addEventListener('click', () => selectCase(caseData));
    return card;
}

// Select a case
function selectCase(caseData) {
    selectedCase = caseData;
    selectedCaseImage.src = caseData.image;
    selectedCaseName.textContent = caseData.name;
    selectedCasePrice.textContent = caseData.price.toFixed(2);
    
    caseSelection.style.display = 'none';
    caseOpening.style.display = 'block';
    
    // Reset the reel
    reel.innerHTML = '';
    reel.style.transform = 'translate(-50%, -50%)';
    reel.classList.remove('spinning');
}

// Update balance display
function updateBalanceDisplay() {
    balanceDisplay.textContent = balance.toFixed(2);
}

// Setup event listeners
function setupEventListeners() {
    openCaseButton.addEventListener('click', openCase);
    backButton.addEventListener('click', backToCases);
    openAgainButton.addEventListener('click', openAgain);
    changeCaseButton.addEventListener('click', changeCase);
}

// Back to case selection
function backToCases() {
    caseSelection.style.display = 'block';
    caseOpening.style.display = 'none';
    selectedCase = null;
}

// Get random item based on rarity weights
function getRandomItem(items) {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    // Map rarities to our weights
    const rarityMap = {
        'Consumer Grade': rarityWeights['Consumer Grade'],
        'Industrial Grade': rarityWeights['Industrial Grade'],
        'Mil-Spec': rarityWeights['Mil-Spec'],
        'Restricted': rarityWeights['Restricted'],
        'Classified': rarityWeights['Classified'],
        'Covert': rarityWeights['Covert'],
        'Rare Special': rarityWeights['Rare Special']
    };
    
    // Calculate total weight for normalization
    let totalWeight = 0;
    items.forEach(item => {
        totalWeight += rarityMap[item.rarity] || 0.1;
    });
    
    // Select item based on weighted random
    for (const item of items) {
        cumulativeWeight += (rarityMap[item.rarity] || 0.1) / totalWeight;
        if (random <= cumulativeWeight) {
            return item;
        }
    }
    
    // Fallback to random item
    return items[Math.floor(Math.random() * items.length)];
}

// Create reel item element
function createReelItem(item) {
    const reelItem = document.createElement('div');
    reelItem.className = `reel-item rarity-${item.rarity.toLowerCase().replace(/\s+/g, '')}`;
    
    // Create SVG image for the item
    const weaponName = item.name.split('|')[0].trim();
    const skinName = item.name.split('|')[1]?.trim() || '';
    const rarityColor = getRarityColor(item.rarity).substring(1);
    
    const svgImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%231b2838' width='150' height='150'/%3E%3Crect fill='%23${rarityColor}' x='20' y='40' width='110' height='70' rx='10' opacity='0.3'/%3E%3Ctext x='75' y='75' font-family='Arial' font-size='12' font-weight='bold' fill='%23${rarityColor}' text-anchor='middle'%3E${weaponName.substring(0, 10)}%3C/text%3E%3Ctext x='75' y='95' font-family='Arial' font-size='10' fill='%23c7d5e0' text-anchor='middle'%3E${skinName.substring(0, 12)}%3C/text%3E%3C/svg%3E`;
    
    reelItem.innerHTML = `
        <img src="${svgImage}" alt="${item.name}">
        <div class="item-name">${item.name}</div>
        <div class="item-rarity">${item.rarity}</div>
    `;
    
    return reelItem;
}

// Get rarity color
function getRarityColor(rarity) {
    const colors = {
        'Consumer Grade': '#b0c3d9',
        'Industrial Grade': '#5e98d9',
        'Mil-Spec': '#4b69ff',
        'Restricted': '#8847ff',
        'Classified': '#d32ce6',
        'Covert': '#eb4b4b',
        'Rare Special': '#ffd700'
    };
    return colors[rarity] || '#c7d5e0';
}

// Open case
async function openCase() {
    if (isOpening) return;
    
    if (balance < selectedCase.price) {
        alert('Insufficient balance!');
        return;
    }
    
    isOpening = true;
    openCaseButton.disabled = true;
    
    // Deduct balance
    balance -= selectedCase.price;
    updateBalanceDisplay();
    
    // Generate items for the reel
    const reelItems = [];
    const wonItem = getRandomItem(selectedCase.items);
    const wonItemIndex = 25; // Position where the won item will be
    
    // Fill reel with random items
    for (let i = 0; i < 50; i++) {
        if (i === wonItemIndex) {
            reelItems.push(wonItem);
        } else {
            // Add random items weighted by rarity
            const randomItem = getRandomItem(selectedCase.items);
            reelItems.push(randomItem);
        }
    }
    
    // Clear and populate reel
    reel.innerHTML = '';
    reelItems.forEach(item => {
        reel.appendChild(createReelItem(item));
    });
    
    // Calculate the position to stop at (center the won item)
    const itemWidth = 260; // 250px width + 10px gap
    const stopPosition = -(wonItemIndex * itemWidth - itemWidth / 2);
    
    // Add spinning class and set transform
    reel.classList.add('spinning');
    
    // Start animation
    setTimeout(() => {
        reel.style.transform = `translate(calc(-50% + ${stopPosition}px), -50%)`;
    }, 50);
    
    // Show result after animation
    setTimeout(() => {
        showResult(wonItem);
        isOpening = false;
        openCaseButton.disabled = false;
    }, 5500);
}

// Show result
function showResult(item) {
    const weaponName = item.name.split('|')[0].trim();
    const skinName = item.name.split('|')[1]?.trim() || '';
    const rarityColor = getRarityColor(item.rarity).substring(1);
    
    const svgImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%231b2838' width='300' height='300'/%3E%3Crect fill='%23${rarityColor}' x='40' y='80' width='220' height='140' rx='20' opacity='0.4'/%3E%3Ctext x='150' y='140' font-family='Arial' font-size='24' font-weight='bold' fill='%23${rarityColor}' text-anchor='middle'%3E${weaponName.substring(0, 10)}%3C/text%3E%3Ctext x='150' y='170' font-family='Arial' font-size='18' fill='%23c7d5e0' text-anchor='middle'%3E${skinName.substring(0, 15)}%3C/text%3E%3Ccircle cx='150' cy='200' r='15' fill='%23${rarityColor}' opacity='0.8'/%3E%3C/svg%3E`;
    
    resultImage.src = svgImage;
    resultName.textContent = item.name;
    resultRarity.textContent = item.rarity;
    resultRarity.style.color = getRarityColor(item.rarity);
    resultPrice.textContent = item.price.toFixed(2);
    
    // Add to balance (simulate selling/keeping)
    balance += item.price;
    updateBalanceDisplay();
    
    resultDisplay.style.display = 'flex';
}

// Open another case
function openAgain() {
    resultDisplay.style.display = 'none';
    
    // Reset reel
    reel.innerHTML = '';
    reel.style.transform = 'translate(-50%, -50%)';
    reel.classList.remove('spinning');
    
    // Small delay for smooth transition
    setTimeout(() => {
        reel.classList.remove('spinning');
    }, 100);
}

// Change case
function changeCase() {
    resultDisplay.style.display = 'none';
    backToCases();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Add some sound effect placeholders (would use actual audio files in production)
function playSound(type) {
    // In a real implementation, you would load and play actual sound files
    // For now, this is a placeholder
    console.log(`Playing ${type} sound`);
}

// Enhanced animation on case hover
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.case-card')) {
        playSound('hover');
    }
});
