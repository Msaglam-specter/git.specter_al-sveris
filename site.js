document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    const urunlerListesi = document.getElementById('urunler-listesi');
    const sepetUrunlerListesi = document.getElementById('sepet-urunler');
    const sepetToplamElementi = document.getElementById('sepet-toplam');
    const bildirimElementi = document.getElementById('bildirim');

    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];

    // Ürünleri Firestore'dan çek ve listele
    if (urunlerListesi) {
        db.collection("producks").orderBy("createdAt", "desc").get()
            .then((querySnapshot) => {
                urunlerListesi.innerHTML = ''; // Önce temizle
                if (querySnapshot.empty) {
                    urunlerListesi.innerHTML = '<p>Gösterilecek ürün bulunamadı.</p>';
                    return;
                }
                querySnapshot.forEach((doc) => {
                    const produck = doc.data();
                    const produckId = doc.id;

                    // Basit bir ürün kartı oluştur
                    const urunKarti = `
                        <div class="urun-karti" data-id="${produckId}">
                            <img src="${produck.resim || 'placeholder.jpg'}" alt="${produck.isim || 'Ürün Resmi'}" style="width:100%; max-width:200px; height:auto; aspect-ratio: 1/1; object-fit: cover;">
                            <h3>${produck.isim || 'İsimsiz Ürün'}</h3>
                            <p>Fiyat: ${produck.fiyat !== undefined ? produck.fiyat.toLocaleString('tr-TR') + ' TL' : '-'}</p>
                            <p>Stok: ${produck.stok !== undefined ? produck.stok : '-'}</p>
                            ${produck.beden ? `<p>Beden: ${produck.beden}</p>` : ''}
                            ${produck.renk ? `<p>Renk: ${produck.renk}</p>` : ''}
                            <button class="sepete-ekle-btn" data-id="${produckId}" data-isim="${produck.isim}" data-fiyat="${produck.fiyat}">Sepete Ekle</button>
                        </div>
                    `;
                    urunlerListesi.innerHTML += urunKarti;
                });

                // Sepete ekle butonlarına event listener ekle
                document.querySelectorAll('.sepete-ekle-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.dataset.id;
                        const isim = this.dataset.isim;
                        const fiyat = parseFloat(this.dataset.fiyat);
                        sepeteEkle({ id, ad: isim, fiyat, adet: 1 }); // Ürün adını 'ad' olarak gönderiyoruz
                    });
                });
            })
            .catch((error) => {
                console.error("Ürünleri yükleme hatası: ", error);
                if (urunlerListesi) urunlerListesi.innerHTML = '<p>Ürünler yüklenirken bir hata oluştu.</p>';
            });
    }

    // Sepet fonksiyonları (bunlar sizin mevcut sepet mantığınıza göre uyarlanabilir)
    function sepeteEkle(urun) {
        const mevcutUrunIndex = sepet.findIndex(item => item.id === urun.id);
        if (mevcutUrunIndex > -1) {
            sepet[mevcutUrunIndex].adet++;
        } else {
            sepet.push(urun);
        }
        localStorage.setItem('sepet', JSON.stringify(sepet));
        gosterBildirim(`${urun.ad} sepete eklendi!`);
        // Sepeti güncelleme fonksiyonunu çağırabilirsiniz (eğer varsa)
        // sepetiGuncelle(); 
    }

    function gosterBildirim(mesaj) {
        if (bildirimElementi) {
            bildirimElementi.textContent = mesaj;
            bildirimElementi.style.display = 'block';
            setTimeout(() => {
                bildirimElementi.style.display = 'none';
            }, 3000);
        }
    }
    // Diğer sepet fonksiyonları (sepetiBosalt, satinAl, sepetiGuncelle vb.) buraya gelebilir.
});

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


