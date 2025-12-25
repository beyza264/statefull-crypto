// Global değişkenler
let currentCoinData = null;

// 1. Sayfa yüklendiğinde cüzdanı getir (Stateful Özellik)
document.addEventListener("DOMContentLoaded", renderWallet);

// 2. Cüzdandaki verileri getiren fonksiyon
function getWallet() {
    // LocalStorage'dan 'myCryptoWallet' anahtarını oku, yoksa boş dizi döndür
    return JSON.parse(localStorage.getItem("myCryptoWallet")) || [];
}

// 3. Veriyi kaydeden fonksiyon
function saveToStorage(data) {
    localStorage.setItem("myCryptoWallet", JSON.stringify(data));
}

// 4. API'den Veri Çekme
async function searchCoin() {
    const input = document.getElementById("cryptoInput").value.toLowerCase().trim();
    if (!input) return;

    try {
        // CoinGecko API (Ücretsiz ve Key gerektirmez)
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${input}`);
        const data = await response.json();

        if (data.length === 0) {
            alert("Coin bulunamadı! Tam adını yazmayı deneyin (örn: bitcoin).");
            return;
        }

        const coin = data[0];
        currentCoinData = {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            image: coin.image,
            change: coin.price_change_percentage_24h
        };

        updateUI(currentCoinData);

    } catch (error) {
        console.error("Hata:", error);
        alert("Bağlantı hatası veya limit aşımı.");
    }
}

// 5. Arayüzü Güncelleme
function updateUI(coin) {
    const card = document.getElementById("resultCard");
    document.getElementById("coinImg").src = coin.image;
    document.getElementById("coinName").innerText = coin.name;
    document.getElementById("coinSymbol").innerText = coin.symbol;
    document.getElementById("currentPrice").innerText = `$${coin.price.toLocaleString()}`;
    
    const changeElem = document.getElementById("priceChange");
    changeElem.innerText = `%${coin.change.toFixed(2)}`;
    changeElem.style.color = coin.change >= 0 ? "#4ade80" : "#ef4444"; // Yeşil veya Kırmızı

    card.classList.remove("hidden");
}

// 6. Cüzdana Ekleme (Stateful İşlem)
function addToWallet() {
    if (!currentCoinData) return;

    const wallet = getWallet();
    
    // Zaten ekli mi kontrol et
    const exists = wallet.find(c => c.id === currentCoinData.id);
    if (exists) {
        alert("Bu coin zaten cüzdanında!");
        return;
    }

    wallet.push(currentCoinData);
    saveToStorage(wallet); // LocalStorage'a kaydet
    renderWallet(); // Listeyi yenile
}

// 7. Cüzdanı Ekrana Basma
function renderWallet() {
    const list = document.getElementById("walletList");
    const wallet = getWallet();
    list.innerHTML = "";

    wallet.forEach(coin => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${coin.image}" width="20">
                <strong>${coin.name}</strong>
            </div>
            <span>$${coin.price.toLocaleString()}</span>
        `;
        list.appendChild(li);
    });
}

// 8. Cüzdanı Temizle
function clearWallet() {
    if(confirm("Tüm cüzdanı silmek istiyor musun?")) {
        localStorage.removeItem("myCryptoWallet");
        renderWallet();
    }
}
