// おかずデータ
const okazuData = {
    heavy: [
        "ジャーマンポテト", "ポテト（塩）", "ポテト（のり塩）", "ポテト（コンソメ）", "ポテトサラダ",
        "かぼちゃサラダ", "かぼちゃの煮物", "マカロニサラダ", "フライドポテト", "磯辺揚げ",
        "ナゲット", "いかのから揚げ", "こふきいも", "ジャーマンかぼちゃ", "ジャガイモのガレット",
        "チヂミ", "春巻きとウインナー", "ジャガイモとニラのオイスター炒め", "マヨカレーポテト", "さつまいもサラダ"
    ],
    other: [
        "ピーマン（おひたし）", "ピーマン（塩昆布）", "ピーマン（無限）", "ピーマン（きんぴら）",
        "なすび（浅漬け）", "なすび（煮びたし）", "なすび（麻婆茄子）", "焼きなすび（鰹節）",
        "豚肉となすの炒め物", "きゅうり（浅漬け）", "きゅうり（旨塩）", "きゅうり（醤油）",
        "ささみときゅうりの中華サラダ", "まいたけ（バター醤油）", "まいたけ（黒故障炒め）",
        "えのき（ポン酢あえ）", "えのき（キムチあえ）", "えのき（キノコ炒め）", "こんにゃく（田楽）",
        "こんにゃく（炊き）", "こんにゃく（玉こん）", "エビマヨ", "エビチリ", "エビとゆで卵のサラダ",
        "エビ（クレソル炒め）", "エビとブロッコリー", "厚揚げ（麵つゆ）", "厚揚げ（餡掛け）",
        "厚揚げ（麺つゆ生姜）", "厚揚げ（キムチチーズ炒め）", "とまと（マリネ）", "とまと（ナムル）",
        "白菜（煮びたし）", "白菜（平天の煮物）", "白菜（浅漬け）", "大根（梅和え）", "大根（漬物）",
        "大根（煮物）", "大根（ステーキ）", "豆腐（煮奴）", "豆腐（冷奴）", "わかめ（酢の物）",
        "たけのこ（若竹煮）", "たけのこ（オイスター炒め）", "たまご（ニラ玉）", "たまご（かに玉）",
        "たまご（だし巻き）", "れんこん（素焼き）", "れんこん（ノリ塩炒め）", "ほうれん草（おひたし）",
        "ほうれん草（ナムル）", "ほうれん草（胡麻和え）", "キャベツ（旨塩）", "キャベツ（コールスロー）",
        "キャベツ（塩昆布和え）", "かいわれ（ハム巻き）", "かいわれ（ささみの中華サラダ）",
        "人参（しりしり）", "人参（キャロットラぺ）", "竹輪の鳥ミンチ詰め", "チョレギサラダ",
        "海藻サラダ", "ただのサラダ", "きんぴら", "高野豆腐", "切り干し大根（キムチ）", "春雨サラダ"
    ],
    soup: [
        "味噌汁（わかめ、豆腐）", "味噌汁（白菜、油揚げ）", "味噌汁（えのき、油揚げ）",
        "味噌汁（大根、油揚げ）", "味噌汁（玉ねぎ、おふ）", "わかめスープ", "卵スープ",
        "水餃子のスープ", "エノキの白ネギの塩スープ", "大根スープ", "マカロニスープ",
        "たまネギスープ", "コンソメスープ", "春雨スープ"
    ]
};

// 過去2回分の選択履歴を保存する配列
let selectionHistory = [];

// ボタンが押された回数をカウント
let buttonPressCount = 0;

// DOM要素の取得
const selectButton = document.getElementById('selectButton');
const resetButton = document.getElementById('resetButton');
const resultsDiv = document.getElementById('results');

// ローカルストレージからデータを読み込む
function loadFromStorage() {
    const savedHistory = localStorage.getItem('okazuHistory');
    const savedCount = localStorage.getItem('okazuButtonCount');
    
    if (savedHistory) {
        selectionHistory = JSON.parse(savedHistory);
    }
    
    if (savedCount) {
        buttonPressCount = parseInt(savedCount);
    }
    
    // 最後の選択結果を表示
    if (selectionHistory.length > 0) {
        const lastSelection = selectionHistory[selectionHistory.length - 1];
        displayResults(lastSelection.heavy, lastSelection.other, lastSelection.soup);
    }
}

// ローカルストレージにデータを保存する
function saveToStorage() {
    localStorage.setItem('okazuHistory', JSON.stringify(selectionHistory));
    localStorage.setItem('okazuButtonCount', buttonPressCount.toString());
}

// ランダム選択関数
function getRandomItems(array, count, excludedItems) {
    const available = array.filter(item => !excludedItems.includes(item));
    
    if (available.length < count) {
        // 利用可能なアイテムが足りない場合は、利用可能なものすべてを返す
        return available;
    }
    
    const selected = [];
    const availableCopy = [...available];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availableCopy.length);
        selected.push(availableCopy.splice(randomIndex, 1)[0]);
    }
    
    return selected;
}

// 結果表示関数
function displayResults(heavy, other, soup) {
    resultsDiv.innerHTML = '';
    
    // 重めのおかず
    if (heavy.length > 0) {
        const heavyDiv = document.createElement('div');
        heavyDiv.className = 'category heavy';
        heavyDiv.innerHTML = `
            <h3>重めのおかず (${heavy.length}個)</h3>
            <div class="okazu-list">
                ${heavy.map(item => `<div class="okazu-item">${item}</div>`).join('')}
            </div>
        `;
        resultsDiv.appendChild(heavyDiv);
    }
    
    // その他のおかず
    if (other.length > 0) {
        const otherDiv = document.createElement('div');
        otherDiv.className = 'category';
        otherDiv.innerHTML = `
            <h3>その他のおかず (${other.length}個)</h3>
            <div class="okazu-list">
                ${other.map(item => `<div class="okazu-item">${item}</div>`).join('')}
            </div>
        `;
        resultsDiv.appendChild(otherDiv);
    }
    
    // スープ
    if (soup.length > 0) {
        const soupDiv = document.createElement('div');
        soupDiv.className = 'category soup';
        soupDiv.innerHTML = `
            <h3>スープ (${soup.length}個)</h3>
            <div class="okazu-list">
                ${soup.map(item => `<div class="okazu-item">${item}</div>`).join('')}
            </div>
        `;
        resultsDiv.appendChild(soupDiv);
    }
    
    // リセットボタンを表示
    resetButton.classList.remove('hidden');
}

// メイン選択関数
function selectOkazu() {
    buttonPressCount++;

    // 過去2回分の選択から除外するアイテムを取得
    let excludedItems = {
        heavy: [],
        other: [],
        soup: []
    };

    // 過去2回分の履歴から除外するアイテムを集める
    const recentHistory = selectionHistory.slice(-2); // 最新2回分
    recentHistory.forEach(selection => {
        excludedItems.heavy.push(...selection.heavy);
        excludedItems.other.push(...selection.other);
        excludedItems.soup.push(...selection.soup);
    });
    
    // それぞれのカテゴリーからランダム選択
    const selectedHeavy = getRandomItems(okazuData.heavy, 2, excludedItems.heavy);
    const selectedOther = getRandomItems(okazuData.other, 10, excludedItems.other);
    const selectedSoup = getRandomItems(okazuData.soup, 3, excludedItems.soup);
    
    // 今回の選択を履歴に追加
    const currentSelection = {
        heavy: selectedHeavy,
        other: selectedOther,
        soup: selectedSoup
    };
    selectionHistory.push(currentSelection);
    
    // ローカルストレージに保存
    saveToStorage();
    
    // 結果を表示
    displayResults(selectedHeavy, selectedOther, selectedSoup);
}

// リセット関数
function resetSelection() {
    selectionHistory = [];
    buttonPressCount = 0;
    resultsDiv.innerHTML = '';
    resetButton.classList.add('hidden');
    
    // ローカルストレージもクリア
    localStorage.removeItem('okazuHistory');
    localStorage.removeItem('okazuButtonCount');
}

// イベントリスナーの設定
selectButton.addEventListener('click', selectOkazu);
resetButton.addEventListener('click', resetSelection);

// 初期状態でリセットボタンを非表示
resetButton.classList.add('hidden');

// ページ読み込み時にローカルストレージからデータを復元
loadFromStorage();
