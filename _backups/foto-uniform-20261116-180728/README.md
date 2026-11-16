# 1e1 Akademi

ZIP dosyasının tamamını çıkarın ve `index.html` dosyasını tarayıcıda açın.
Site statik HTML, CSS ve JavaScript ile çalışır. Yerel fotoğraflar, yazı tipleri ve mezun önizlemeleri `assets` klasöründedir. WhatsApp, Instagram, Google yorumları ve harita bağlantıları için internet bağlantısı gerekir.

- `index.html` sayfa bölümlerini ve metinleri içerir.
- `assets/css/brand-v2.css` renk, tipografi ve duyarlı sayfa düzenini içerir.
- `assets/css/alumni.css` mezun portreleri, sıralamalar ve kart düzenini içerir.
- `assets/js` menü, sayaç, açılış videosu, kaydırma animasyonları, imleç ve mezun önizlemelerini yönetir.

Açılış videosu mevcut akademi fotoğraflarından hazırlanmıştır ve `assets/media/akademi-hero.webm` dosyasındadır. Hareketi azaltma ayarı açıkken açılış fotoğrafı gösterilir.

Kütüphane kullanımında çalışma, telefon ve mola düzeni gözetmen takibinde yürütülür.

Google yorum kartları kullanıcının masaüstündeki yorumlar.txt dosyasından alınan Enes Cagdas Sezgin ve Melike Zeren Kayahan yorumlarını, verilen 5 yıldız bilgileriyle sabit olarak gösterir; otomatik güncellenmez. Her iki yorumun kısa görünümü iki satırla sınırlıdır; “Diğer” tam metni sayfa içinde açar. Kaynak satırı kullanıcı talebiyle aynen korunmuştur. “Google’da gör” bağlantıları kullanıcının güncel yorumlar.txt dosyasında verdiği bireysel yorum adreslerine gider; adresler değiştirilmeden korunmuştur. Kaynak notları assets/data/google-reviews.json dosyasındadır.

Mezun kapakları kullanıcının masaüstündeki fotolar.zip arşivinden alınmıştır. 14 fotoğraf dosya adındaki öğrenci kimliğiyle eşleştirilmiş; “Ofiste gülümseyen genç kadın.jpg” dosyası kullanıcının açık onayıyla Ayça Önver kartına atanmıştır. Fotoğraf dosyaları yeniden kodlanmadan, ZIP içeriğiyle bire bir aynı olarak kopyalanır; sitede 4:5 alana ortalanarak yerleştirilir. Önizleme videoları ve mevcut video kadrajları korunmuştur. Kaynak arşiv, dosya eşleştirmesi, boyut ve SHA-256 kayıtları assets/media/alumni/manifest.json içindedir.
