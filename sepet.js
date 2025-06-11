window.onload = function() {
    let sepet = JSON.parse(localStorage.getItem('sepet')) || [];
    let sepetAlani = document.getElementById('sepetAlani');
    sepetAlani.innerHTML = '';

    function sepetiGuncelle() {
        // Ürünleri ada göre gruplandır
        let grupluSepet = {};
        sepet.forEach(function(urun) {
            if (grupluSepet[urun.ad]) {
                grupluSepet[urun.ad].adet += 1;
            } else {
                grupluSepet[urun.ad] = {
                    ...urun,
                    adet: 1
                };
            }
        });

        sepetAlani.innerHTML = '';
        if (sepet.length === 0) {
            sepetAlani.innerHTML = '<div class="bos">Sepetiniz boş.</div>';
            return;
        }

        Object.values(grupluSepet).forEach(function(urun) {
            let urunDiv = document.createElement('div');
            urunDiv.className = 'sepet-urun';
            urunDiv.innerHTML = `
                <img src="../${urun.resim}" width="50" />
                <span>${urun.ad}</span>
                <strong>${urun.fiyat}</strong>
                <button class="azalt">-</button>
                <span>Adet: ${urun.adet}</span>
                <button class="arttir">+</button>
            `;
            sepetAlani.appendChild(urunDiv);

            // Butonlara event ekle
            urunDiv.querySelector('.azalt').onclick = function() {
                if (urun.adet > 1) {
                    // Sepetten bir tane sil
                    let index = sepet.findIndex(u => u.ad === urun.ad);
                    if (index !== -1) {
                        sepet.splice(index, 1);
                        localStorage.setItem('sepet', JSON.stringify(sepet));
                        sepetiGuncelle();
                    }
                } else {
                    // Son ürünü de silersek tamamen kaldır
                    sepet = sepet.filter(u => u.ad !== urun.ad);
                    localStorage.setItem('sepet', JSON.stringify(sepet));
                    sepetiGuncelle();
                }
            };
            urunDiv.querySelector('.arttir').onclick = function() {
                sepet.push({
                    ad: urun.ad,
                    fiyat: urun.fiyat,
                    resim: urun.resim
                });
                localStorage.setItem('sepet', JSON.stringify(sepet));
                sepetiGuncelle();
            };
        });
    }

    sepetiGuncelle();
};