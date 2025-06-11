function bildirimGoster(mesaj) {
    const bildirim = document.getElementById('bildirim');
    bildirim.textContent = mesaj;
    bildirim.style.display = 'block';
    setTimeout(() => {
        bildirim.style.display = 'none';
    }, 3000); // 3 saniye sonra kaybolur
}

function sepeteEkle(ad, fiyat, resim) {
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    let urun = sepet.find(u => u.ad === ad && u.fiyat === fiyat && u.resim === resim);
    if (urun) {
        urun.adet += 1;
    } else {
        sepet.push({ad, fiyat, resim, adet: 1});
    }
    localStorage.setItem('sepet', JSON.stringify(sepet));
    sepetiGuncelle();
    bildirimGoster("Ürün sepete eklendi!");
}

function sepetiGuncelle() {
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    const sepetList = document.getElementById('sepet-urunler');
    const toplamSpan = document.getElementById('sepet-toplam');
    sepetList.innerHTML = '';
    let toplam = 0;

    sepet.forEach((urun, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${urun.ad} - ${urun.fiyat} 
            <button onclick="adetAzalt(${index})">-</button>
            <span style="margin:0 5px;">${urun.adet}</span>
            <button onclick="adetArttir(${index})">+</button>
        `;
        sepetList.appendChild(li);
        toplam += parseInt(urun.fiyat.replace(/\D/g, '')) * urun.adet;
    });

    toplamSpan.textContent = toplam + ' TL';
}

function adetAzalt(index) {
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    if (sepet[index].adet > 1) {
        sepet[index].adet -= 1;
    } else {
        sepet.splice(index, 1);
    }
    localStorage.setItem('sepet', JSON.stringify(sepet));
    sepetiGuncelle();
}

function adetArttir(index) {
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    sepet[index].adet += 1;
    localStorage.setItem('sepet', JSON.stringify(sepet));
    sepetiGuncelle();
}

function sepetiBosalt() {
    localStorage.removeItem('sepet');
    sepetiGuncelle();
}

function satinAl() {
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    if (sepet.length === 0) {
        bildirimGoster('Sepetiniz boş!');
        return;
    }

    // Siparişi backend'e gönder
    fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sepet: sepet,
            tarih: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            bildirimGoster('Satın alma işlemi başarılı!');
            sepetiBosalt();
        } else {
            bildirimGoster('Sipariş gönderilemedi!');
        }
    })
    .catch(() => {
        bildirimGoster('Sunucuya bağlanılamadı!');
    });
}

window.onload = sepetiGuncelle;

document.addEventListener('DOMContentLoaded',document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/producks')
        .then(res => res.json())
        .then(producks => {
            const urunlerDiv = document.getElementById('urunler-listesi');
            urunlerDiv.innerHTML = '';
            producks.forEach(produck => {
                urunlerDiv.innerHTML += `
                    <div class="urun">
                        <div class="urun-img-wrap">
                            <img src="${produck.resim || 'default.jpg'}" alt="${produck.isim}">
                        </div>
                        <h2>${produck.isim}</h2>
                        <strong>${produck.fiyat}</strong>
                        <button class="sepet-btn" onclick="sepeteEkle('${produck.isim}', '${produck.fiyat}', '${produck.resim}')">Sepete Ekle</button>
                    </div>
                `;
            });
        });
}));
//ürünleri listele
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/producks')
        .then(res => res.json())
        .then(producks => {
            const urunlerDiv = document.getElementById('urunler-listesi');
            urunlerDiv.innerHTML = '';
            producks.forEach(produck => {
                urunlerDiv.innerHTML += `
                    <div class="urun">
                        <div class="urun-img-wrap">
                            <img src="${produck.resim || 'default.jpg'}" alt="${produck.isim}">
                        </div>
                        <h2>${produck.isim}</h2>
                        <strong>${produck.fiyat}</strong>
                        <button class="sepet-btn" onclick="sepeteEkle('${produck.isim}', '${produck.fiyat}', '${produck.resim}')">Sepete Ekle</button>
                    </div>
                `;
            });
        });
});
// Sepet güncelleme işlemi