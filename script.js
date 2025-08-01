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

// リアルタイム同期用の変数
let isConnected = false;
let syncId = 'okazu-' + Math.random().toString(36).substr(2, 9);

// シンプルなWebSocket代替（localStorage + storageイベント）
function initRealtimeSync() {
    // 他のタブからの変更を監視
    window.addEventListener('storage', function(e) {
        if (e.key === 'okazuRealtime') {
            const data = JSON.parse(e.newValue);
            if (data.syncId !== syncId) { // 自分以外からの変更
                handleRealtimeUpdate(data);
            }
        }
    });
    
    // 定期的にリアルタイムデータをチェック
    setInterval(checkRealtimeUpdates, 500);
    isConnected = true;
}

// リアルタイムデータを送信
function sendRealtimeUpdate(type, data) {
    if (!isConnected) return;
    
    const updateData = {
        type: type,
        data: data,
        timestamp: Date.now(),
        syncId: syncId
    };
    
    localStorage.setItem('okazuRealtime', JSON.stringify(updateData));
    
    // 即座にローカルでも処理（同じタブ内でのテスト用）
    setTimeout(() => {
        const storedData = localStorage.getItem('okazuRealtime');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.timestamp === updateData.timestamp && parsedData.syncId !== syncId) {
                handleRealtimeUpdate(parsedData);
            }
        }
    }, 100);
}

// リアルタイム更新を処理
function handleRealtimeUpdate(updateData) {
    switch(updateData.type) {
        case 'selection':
            // 抽選結果の同期
            selectionHistory = updateData.data.selectionHistory;
            buttonPressCount = updateData.data.buttonPressCount;
            displayResults(updateData.data.heavy, updateData.data.other, updateData.data.soup);
            
            // ヘッダーも同期
            if (updateData.data.headers) {
                header1.textContent = updateData.data.headers[0];
                header2.textContent = updateData.data.headers[1];
                header3.textContent = updateData.data.headers[2];
                header4.textContent = updateData.data.headers[3];
                header5.textContent = updateData.data.headers[4];
            }
            break;
            
        case 'input':
            // インプット値の同期
            if (updateData.data.okazuInput !== undefined) {
                okazuInput.value = updateData.data.okazuInput;
            }
            if (updateData.data.categorySelect !== undefined) {
                categorySelect.value = updateData.data.categorySelect;
            }
            break;
            
        case 'tableInput':
            // テーブルインプットの同期
            const tableInputElements = document.querySelectorAll('.table-input');
            if (updateData.data.index !== undefined && tableInputElements[updateData.data.index]) {
                tableInputElements[updateData.data.index].value = updateData.data.value;
            }
            break;
            
        case 'add':
            // おかず追加の同期
            okazuData[updateData.data.category] = updateData.data.newData;
            updateDeleteOptions();
            break;
            
        case 'delete':
            // おかず削除の同期
            okazuData[updateData.data.category] = updateData.data.newData;
            updateDeleteOptions();
            break;
            
        case 'reset':
            // リセットの同期
            selectionHistory = [];
            buttonPressCount = 0;
            resultsDiv.innerHTML = '';
            resetButton.classList.add('hidden');
            
            // ヘッダーをリセット
            header1.textContent = '母';
            header2.textContent = '母';
            header3.textContent = '父';
            header4.textContent = '優馬';
            header5.textContent = '夢月';
            
            // テーブルインプットもクリア
            const resetTableInputs = document.querySelectorAll('.table-input');
            resetTableInputs.forEach(input => {
                input.value = '';
            });
            break;
    }
}

// 定期的なリアルタイムチェック
let lastCheckedTimestamp = 0;
function checkRealtimeUpdates() {
    const realtimeData = localStorage.getItem('okazuRealtime');
    if (realtimeData) {
        const data = JSON.parse(realtimeData);
        // 10秒以内で、自分以外からの変更で、まだ処理していないデータ
        if (Date.now() - data.timestamp < 10000 && 
            data.syncId !== syncId && 
            data.timestamp > lastCheckedTimestamp) {
            handleRealtimeUpdate(data);
            lastCheckedTimestamp = data.timestamp;
        }
    }
}

// DOM要素の取得
const selectButton = document.getElementById('selectButton');
const resetButton = document.getElementById('resetButton');
const resultsDiv = document.getElementById('results');
const categorySelect = document.getElementById('categorySelect');
const okazuInput = document.getElementById('okazuInput');
const addButton = document.getElementById('addButton');
const deleteCategorySelect = document.getElementById('deleteCategorySelect');
const deleteOkazuSelect = document.getElementById('deleteOkazuSelect');
const deleteButton = document.getElementById('deleteButton');

// テーブルヘッダーの要素を取得
const header1 = document.getElementById('header1');
const header2 = document.getElementById('header2');
const header3 = document.getElementById('header3');
const header4 = document.getElementById('header4');
const header5 = document.getElementById('header5');

// ローカルストレージからデータを読み込む
function loadFromStorage() {
    const savedHistory = localStorage.getItem('okazuHistory');
    const savedCount = localStorage.getItem('okazuButtonCount');
    const savedOkazuData = localStorage.getItem('okazuData');
    
    if (savedHistory) {
        selectionHistory = JSON.parse(savedHistory);
    }
    
    if (savedCount) {
        buttonPressCount = parseInt(savedCount);
    }
    
    if (savedOkazuData) {
        const loadedData = JSON.parse(savedOkazuData);
        // 既存のデータに追加されたおかずをマージ
        Object.keys(loadedData).forEach(category => {
            okazuData[category] = loadedData[category];
        });
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
    localStorage.setItem('okazuData', JSON.stringify(okazuData));
}

// おかずを追加する関数
function addOkazu() {
    const category = categorySelect.value;
    const newOkazu = okazuInput.value.trim();
    
    if (newOkazu === '') {
        alert('おかず名を入力してください');
        return;
    }
    
    if (okazuData[category].includes(newOkazu)) {
        alert('そのおかずは既に登録されています');
        return;
    }
    
    // おかずを追加
    okazuData[category].push(newOkazu);
    
    // ローカルストレージに保存
    saveToStorage();
    
    // 削除用のセレクトボックスを更新
    updateDeleteOptions();
    
    // インプットをクリア
    okazuInput.value = '';
    
    alert(`「${newOkazu}」を${categorySelect.options[categorySelect.selectedIndex].text}に追加しました`);
    
    // リアルタイム同期
    sendRealtimeUpdate('add', {
        category: category,
        newData: okazuData[category]
    });
}

// おかずを削除する関数
function deleteOkazu() {
    const category = deleteCategorySelect.value;
    const okazuToDelete = deleteOkazuSelect.value;
    
    if (okazuToDelete === '') {
        alert('削除するおかずを選択してください');
        return;
    }
    
    // 確認ダイアログ
    if (!confirm(`「${okazuToDelete}」を削除しますか？`)) {
        return;
    }
    
    // おかずを削除
    const index = okazuData[category].indexOf(okazuToDelete);
    if (index > -1) {
        okazuData[category].splice(index, 1);
    }
    
    // ローカルストレージに保存
    saveToStorage();
    
    // 削除用のセレクトボックスを更新
    updateDeleteOptions();
    
    alert(`「${okazuToDelete}」を削除しました`);
    
    // リアルタイム同期
    sendRealtimeUpdate('delete', {
        category: category,
        newData: okazuData[category]
    });
}

// 削除用セレクトボックスを更新する関数
function updateDeleteOptions() {
    const category = deleteCategorySelect.value;
    const okazuList = okazuData[category];
    
    // セレクトボックスをクリア
    deleteOkazuSelect.innerHTML = '<option value="">削除するおかずを選択</option>';
    
    // おかずのオプションを追加
    okazuList.forEach(okazu => {
        const option = document.createElement('option');
        option.value = okazu;
        option.textContent = okazu;
        deleteOkazuSelect.appendChild(option);
    });
}

// テーブルヘッダーを変更する関数
function updateTableHeaders() {
    // 現在のヘッダーの値を取得
    const currentHeaders = [
        header1.textContent,
        header2.textContent,
        header3.textContent,
        header4.textContent,
        header5.textContent
    ];
    
    // ローテーション: 最後の要素を最初に移動し、他は左にシフト
    // 項目1と項目2は同じ値にする
    const rotatedHeaders = [
        currentHeaders[2], // 項目3 → 項目1
        currentHeaders[2], // 項目3 → 項目2（項目1と同じ）
        currentHeaders[3], // 項目4 → 項目3
        currentHeaders[4], // 項目5 → 項目4
        currentHeaders[0]  // 項目1 → 項目5
    ];
    
    // ヘッダーを更新
    header1.textContent = rotatedHeaders[0];
    header2.textContent = rotatedHeaders[1];
    header3.textContent = rotatedHeaders[2];
    header4.textContent = rotatedHeaders[3];
    header5.textContent = rotatedHeaders[4];
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
    
    // サラダ系のおかずを特別に処理
    const saladItems = okazuData.other.filter(item => item.includes('サラダ'));
    const selectedSalads = getRandomItems(saladItems, 2, []); // サラダは制限なしで2個選択
    
    // その他のおかずからサラダ以外を選択（サラダを除外リストに追加）
    const nonSaladOther = okazuData.other.filter(item => !item.includes('サラダ'));
    const excludedNonSaladOther = excludedItems.other.filter(item => !item.includes('サラダ'));
    const selectedNonSaladOther = getRandomItems(nonSaladOther, 8, excludedNonSaladOther); // 残り8個
    
    // サラダとその他を結合
    const selectedOther = [...selectedSalads, ...selectedNonSaladOther];
    
    // それぞれのカテゴリーからランダム選択
    const selectedHeavy = getRandomItems(okazuData.heavy, 2, excludedItems.heavy);
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
    
    // テーブルヘッダーを変更
    updateTableHeaders();
    
    // 結果を表示
    displayResults(selectedHeavy, selectedOther, selectedSoup);
    
    // リアルタイム同期
    sendRealtimeUpdate('selection', {
        heavy: selectedHeavy,
        other: selectedOther,
        soup: selectedSoup,
        selectionHistory: selectionHistory,
        buttonPressCount: buttonPressCount,
        headers: [
            header1.textContent,
            header2.textContent,
            header3.textContent,
            header4.textContent,
            header5.textContent
        ]
    });
}

// リセット関数
function resetSelection() {
    selectionHistory = [];
    buttonPressCount = 0;
    resultsDiv.innerHTML = '';
    resetButton.classList.add('hidden');
    
    // ヘッダーをリセット
    header1.textContent = '母';
    header2.textContent = '母';
    header3.textContent = '父';
    header4.textContent = '優馬';
    header5.textContent = '夢月';
    
    // テーブルインプットもクリア
    const resetTableInputsLocal = document.querySelectorAll('.table-input');
    resetTableInputsLocal.forEach(input => {
        input.value = '';
    });
    
    // ローカルストレージもクリア
    localStorage.removeItem('okazuHistory');
    localStorage.removeItem('okazuButtonCount');
    // おかずデータはリセットしない（追加したおかずを保持）
    
    // リアルタイム同期
    sendRealtimeUpdate('reset', {});
}

// イベントリスナーの設定
selectButton.addEventListener('click', selectOkazu);
resetButton.addEventListener('click', resetSelection);
addButton.addEventListener('click', addOkazu);
deleteButton.addEventListener('click', deleteOkazu);

// 削除カテゴリー変更時にオプションを更新
deleteCategorySelect.addEventListener('change', updateDeleteOptions);

// Enterキーでおかず追加
okazuInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addOkazu();
    }
});

// インプットフィールドのリアルタイム同期
okazuInput.addEventListener('input', function() {
    sendRealtimeUpdate('input', {
        okazuInput: okazuInput.value
    });
});

categorySelect.addEventListener('change', function() {
    sendRealtimeUpdate('input', {
        categorySelect: categorySelect.value
    });
});

// 初期状態でリセットボタンを非表示
resetButton.classList.add('hidden');

// ページ読み込み時にローカルストレージからデータを復元
loadFromStorage();

// リアルタイム同期を開始
initRealtimeSync();

// 削除用のセレクトボックスを初期化
updateDeleteOptions();

// テーブルインプットフィールドのリアルタイム同期
const tableInputs = document.querySelectorAll('.table-input');
tableInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
        sendRealtimeUpdate('tableInput', {
            index: index,
            value: input.value
        });
    });
});
