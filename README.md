# 1e1 Akademi

ZIP dosyasının tamamını çıkarın ve `index.html` dosyasını tarayıcıda açın.
Site statik HTML, CSS ve JavaScript ile çalışır. Yerel fotoğraflar, yazı tipleri ve mezun önizlemeleri `assets` klasöründedir. WhatsApp, Instagram, Google yorumları ve harita bağlantıları için internet bağlantısı gerekir.

- `index.html` sayfa bölümlerini ve metinleri içerir.
- `assets/css/brand-v2.css` renk, tipografi ve duyarlı sayfa düzenini içerir.
- `assets/css/alumni.css` mezun portreleri, sıralamalar ve kart düzenini içerir.
- `assets/js` menü, sayaç, açılış videosu, kaydırma animasyonları, imleç ve mezun önizlemelerini yönetir.

Açılış videosu mevcut akademi fotoğraflarından hazırlanmıştır ve `assets/media/akademi-hero.webm` dosyasındadır. Hareketi azaltma ayarı açıkken açılış fotoğrafı gösterilir.

Kütüphane kullanımında çalışma, telefon ve mola düzeni gözetmen takibinde yürütülür.

Google değerlendirme özeti, Yorum yaz düğmesi ve mevcut iki yorum, açılış ekranından kaldırılıp Mezunlarımız bölümünün hemen altındaki ayrı yorum alanında birleştirilmiştir. Yorum yaz bağlantısı Google değerlendirme ekranını açar; site içinde yorum kaydı yapılmaz. Açılıştaki ücretsiz tanışma görüşmesi ve 1 saatlik ücretsiz deneme dersi bağlantıları mobilde açıklamalı, alt alta iki karttır. Deneme dersi alanında öğretmenleri ve anlatım tekniğini tanımak için gerçekten bir saat bire bir ders yapıldığı ve bu dersten ücret alınmadığı açıklanır.

Google yorum kartları kullanıcının masaüstündeki yorumlar.txt dosyasından alınan Enes Cagdas Sezgin ve Melike Zeren Kayahan yorumlarını, verilen 5 yıldız bilgileriyle sabit olarak gösterir; otomatik güncellenmez. Her iki yorumun kısa görünümü iki satırla sınırlıdır; “Diğer” tam metni sayfa içinde açar. Kaynak satırı kullanıcı talebiyle aynen korunmuştur. “Google’da gör” bağlantıları kullanıcının güncel yorumlar.txt dosyasında verdiği bireysel yorum adreslerine gider; adresler değiştirilmeden korunmuştur. Kaynak notları assets/data/google-reviews.json dosyasındadır.

Mezun kapakları kullanıcının masaüstündeki foto.zip arşivinden, dosya adları öğrenci kartlarıyla eşleştirilerek alınmıştır. PNG ve JPEG dosyaları gerçek uzantılarıyla, yeniden kodlanmadan kopyalanmıştır. Kapaklar ve önizlemeler aynı 9:16 çerçevede, üstten hizalı ve tamamı görünür olacak şekilde gösterilir; kişiye özel yakınlaştırma ve alt hizalama kaldırılmıştır. Fare videonun üzerindeyken video alanı ve ilgili kart marka mavisi çerçeve alır. Önizlemenin üstü sabit menünün altında kaldığında yalnızca yukarı doğru küçük bir konum düzeltmesi yapılır; sayfa aşağı itilmez. Sağ alttaki bağımsız oynat/duraklat düğmesi yalnızca sessiz önizlemeyi kontrol eder; Instagram açmaz. Videonun ortasına tıklama/dokunma veya Röportajı izle bağlantısı ilgili Instagram röportajını yeni sekmede açar. Fareyle üzerine gelince önizleme başlar; düğmeyle açıkça duraklatılan önizleme kendiliğinden tekrar başlamaz. Video dosyaları değiştirilmemiştir. Kaynak arşiv, eşleştirme, boyut, SHA-256 ve ortak kadraj kayıtları assets/media/alumni/manifest.json içindedir.
