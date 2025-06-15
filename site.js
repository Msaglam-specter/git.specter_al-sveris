let sepet = JSON.parse(localStorage.getItem('sepet')) || [];

// Bildirim gösterme fonksiyonu (Global)
function bildirimGoster(mesaj) {
    const bildirim = document.getElementById('bildirim');
    if (bildirim) {
        bildirim.textContent = mesaj;
        bildirim.style.display = 'block';
        setTimeout(() => {
            bildirim.style.display = 'none';
        }, 3000);
    }
}

// Sepeti HTML'de ve localStorage'da güncelleyen fonksiyon (Global)
function sepetiGuncelle() {
    const sepetList = document.getElementById('sepet-urunler');
    const toplamSpan = document.getElementById('sepet-toplam');

    if (!sepetList || !toplamSpan) {
        // DOM elementleri henüz yüklenmemiş olabilir.
        return;
    }

    sepetList.innerHTML = '';
    let toplamFiyat = 0;

    sepet.forEach((urun, index) => {
        const li = document.createElement('li');
        // Fiyatın sayı olduğundan emin olalım
        const fiyatSayisal = parseFloat(urun.fiyat);

        li.innerHTML = `
            ${urun.ad} - ${fiyatSayisal.toLocaleString('tr-TR')} TL 
            <button onclick="adetAzalt(${index})">-</button>
            <span style="margin:0 5px;">${urun.adet}</span>
            <button onclick="adetArttir(${index})">+</button>
        `;
        sepetList.appendChild(li);
        if (!isNaN(fiyatSayisal)) {
            toplamFiyat += fiyatSayisal * urun.adet;
        }
    });

    toplamSpan.textContent = toplamFiyat.toLocaleString('tr-TR') + ' TL';
    localStorage.setItem('sepet', JSON.stringify(sepet));
}

document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    const urunlerListesi = document.getElementById('urunler-listesi');
    sepetiGuncelle(); // Sayfa yüklendiğinde sepeti ilk kez güncelle

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
                        ${produck.kategori ? `<p>Kategori: ${produck.kategori}</p>` : ''}
                        <div class="urun-karti" data-id="${produckId}">
                            <img src="${produck.resim || 'placeholder.jpg'}" alt="${produck.isim || 'Ürün Resmi'}" style="width:100%; max-width:200px; height:auto; aspect-ratio: 1/1; object-fit: cover;">
                            <h3>${produck.isim || 'İsimsiz Ürün'}</h3>
                            <p>Fiyat: ${produck.fiyat !== undefined ? produck.fiyat.toLocaleString('tr-TR') + ' TL' : '-'}</p>
                            <p>Stok: ${produck.stok !== undefined ? produck.stok : '-'}</p>
                            ${produck.beden ? `<p>Beden: ${produck.beden}</p>` : ''}
                            ${produck.renk ? `<p>Renk: ${produck.renk}</p>` : ''}
                            <button class="sepete-ekle-btn" data-id="${produckId}" data-isim="${produck.isim}" data-fiyat="${produck.fiyat}" data-resim="${produck.resim || 'placeholder.jpg'}">Sepete Ekle</button>
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
                        const resim = this.dataset.resim; // Resim bilgisini de alalım
                        urunSepeteEkle({ id, ad: isim, fiyat, resim, adet: 1 });
                    });
                });
            })
            .catch((error) => {
                console.error("Ürünleri yükleme hatası: ", error);
                if (urunlerListesi) urunlerListesi.innerHTML = '<p>Ürünler yüklenirken bir hata oluştu.</p>';
            });
    }

    // Ürün kartlarından sepete ekleme fonksiyonu (DOMContentLoaded içinde tanımlı)
    function urunSepeteEkle(urun) {
        const mevcutUrunIndex = sepet.findIndex(item => item.id === urun.id);
        if (mevcutUrunIndex > -1) {
            sepet[mevcutUrunIndex].adet++;
        } else {
            sepet.push(urun);
        }
        bildirimGoster(`${urun.ad} sepete eklendi!`);
        sepetiGuncelle(); // Sepet görünümünü ve localStorage'ı güncelle
    }

    // HTML'deki onclick="satinAl()" butonunun çalışması için global yapıyoruz
    window.satinAl = function() {
        if (sepet.length === 0) {
            bildirimGoster('Sepetiniz boş!');
            return;
        }

        const adres = prompt("Lütfen teslimat adresinizi giriniz:", "Örnek Mah. Test Sok. No:1 Daire:2 İlçe/İl");
        if (adres === null) { // Kullanıcı iptal ederse
            bildirimGoster("Sipariş iptal edildi.");
            return;
        }

        const yeniSiparis = {
            sepet: sepet, // Global sepet dizisini kullan
            tarih: firebase.firestore.FieldValue.serverTimestamp(),
            adres: adres || "Adres belirtilmedi", // Boş adres durumunda
            durum: "Bekliyor" // Yeni siparişler için varsayılan durum
        };

        db.collection("orders").add(yeniSiparis)
            .then((docRef) => {
                bildirimGoster('Siparişiniz başarıyla alındı! Sipariş ID: ' + docRef.id);
                sepetiBosalt(false); // Sepeti temizle (global fonksiyonu çağır)bildirim gösterme
            })
            .catch((error) => {
                console.error("Sipariş oluşturma hatası: ", error);
                bildirimGoster('Sipariş oluşturulurken bir hata oluştu.');
            });
    };
});

// Bu fonksiyonlar global olmalı çünkü HTML içindeki onclick eventleri tarafından çağrılıyorlar.
function adetAzalt(index) {
    if (sepet[index].adet > 1) {
        sepet[index].adet -= 1;
    } else {
        sepet.splice(index, 1); // Ürün adedi 1 ise ve azaltılırsa ürünü sepetten çıkar
    }
    sepetiGuncelle();
}

function adetArttir(index) {
    sepet[index].adet += 1;
    sepetiGuncelle();
}

function sepetiBosalt(bildirimyap = true) {
    sepet = []; // Global sepet dizisini boşalt
    sepetiGuncelle(); // Değişikliği yansıt
    if (bildirimyap)
    bildirimGoster("Sepet boşaltıldı.");
}
