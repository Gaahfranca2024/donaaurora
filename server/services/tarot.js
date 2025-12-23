const axios = require('axios');

// Helper to map card names to Sacred Texts URLs (Rider-Waite)
const getCardImage = (cardName, cardType) => {
    // Normalize name
    const name = cardName.toLowerCase();

    // Major Arcana Map
    const majorMap = {
        'the fool': 'ar00',
        'the magician': 'ar01',
        'the high priestess': 'ar02',
        'the empress': 'ar03',
        'the emperor': 'ar04',
        'the hierophant': 'ar05',
        'the lovers': 'ar06',
        'the chariot': 'ar07',
        'strength': 'ar08',
        'the hermit': 'ar09',
        'wheel of fortune': 'ar10',
        'justice': 'ar11',
        'the hanged man': 'ar12',
        'death': 'ar13',
        'temperance': 'ar14',
        'the devil': 'ar15',
        'the tower': 'ar16',
        'the star': 'ar17',
        'the moon': 'ar18',
        'the sun': 'ar19',
        'judgement': 'ar20',
        'the world': 'ar21'
    };

    if (majorMap[name]) {
        return `https://www.sacred-texts.com/tarot/pkt/img/${majorMap[name]}.jpg`;
    }

    // Minor Arcana (wands, cups, swords, pentacles)
    // Format: cu01 (Ace Cups), cu02, ..., cukn (King)
    // Suits: wands=wa, cups=cu, swords=sw, pentacles=pe

    let suitCode = '';
    if (name.includes('wands')) suitCode = 'wa';
    else if (name.includes('cups')) suitCode = 'cu';
    else if (name.includes('swords')) suitCode = 'sw';
    else if (name.includes('pentacles')) suitCode = 'pe';

    if (!suitCode) return null; // Logic fail fallback

    let valueCode = '';
    if (name.includes('ace')) valueCode = 'ac';
    else if (name.includes('two')) valueCode = '02';
    else if (name.includes('three')) valueCode = '03';
    else if (name.includes('four')) valueCode = '04';
    else if (name.includes('five')) valueCode = '05';
    else if (name.includes('six')) valueCode = '06';
    else if (name.includes('seven')) valueCode = '07';
    else if (name.includes('eight')) valueCode = '08';
    else if (name.includes('nine')) valueCode = '09';
    else if (name.includes('ten')) valueCode = '10';
    else if (name.includes('page')) valueCode = 'pa';
    else if (name.includes('knight')) valueCode = 'kn';
    else if (name.includes('queen')) valueCode = 'qu';
    else if (name.includes('king')) valueCode = 'ki';

    if (suitCode && valueCode) {
        return `https://www.sacred-texts.com/tarot/pkt/img/${suitCode}${valueCode}.jpg`;
    }

    return null;
};

const getDraw = async (count = 3) => {
    try {
        const response = await axios.get(`https://tarotapi.dev/api/v1/cards/random?n=${count}`);
        const cards = response.data.cards.map(card => {
            const image = getCardImage(card.name, card.type) || "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg";
            return {
                ...card,
                image: image
            };
        });
        return cards;
    } catch (error) {
        console.error('Error fetching cards:', error.message);
        // Fallback cards (Standard Rider-Waite)
        const fallbackDeck = [
            {
                name: 'The Magician',
                type: 'major',
                meaning_up: 'Manifestation, resourcefulness, power',
                image: 'https://www.sacred-texts.com/tarot/pkt/img/ar01.jpg'
            },
            {
                name: 'The High Priestess',
                type: 'major',
                meaning_up: 'Intuition, sacred knowledge, divine feminine',
                image: 'https://www.sacred-texts.com/tarot/pkt/img/ar02.jpg'
            },
            {
                name: 'The Empress',
                type: 'major',
                meaning_up: 'Femininity, beauty, nature, nurturing',
                image: 'https://www.sacred-texts.com/tarot/pkt/img/ar03.jpg'
            },
            {
                name: 'The Emperor',
                type: 'major',
                meaning_up: 'Authority, structure, control, fatherhood',
                image: 'https://www.sacred-texts.com/tarot/pkt/img/ar04.jpg'
            },
            {
                name: 'The Hierophant',
                type: 'major',
                meaning_up: 'Spiritual wisdom, religious beliefs, conformity',
                image: 'https://www.sacred-texts.com/tarot/pkt/img/ar05.jpg'
            }
        ];

        // Return requested number of cards (slice ensures we don't return too many, but for >5 we might need loop/repeat logic, but 5 is max for now)
        return fallbackDeck.slice(0, count);
    }
};

module.exports = { getDraw };
