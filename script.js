const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");
const palette = document.getElementById("palette");
const paletteSection = document.getElementById("paletteSection");

const colorThief = new ColorThief();
let currentImageURL = null;

imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        status.textContent = "Silakan pilih file gambar.";
        return;
    }

    if (currentImageURL) {
        URL.revokeObjectURL(currentImageURL);
    }

    currentImageURL = URL.createObjectURL(file);

    preview.onload = function () {
        preview.hidden = false;
        status.textContent = "Gambar berhasil dimuat.";
        palette.innerHTML = "";
        paletteSection.hidden = true;

        try {
            const colors = colorThief.getPalette(preview, 6);

            if (!colors || colors.length === 0) {
                throw new Error("Palet warna tidak ditemukan.");
            }

            colors.forEach(([r, g, b]) => {
                const hex = "#" + [r, g, b]
                    .map(value => value.toString(16).padStart(2, "0"))
                    .join("")
                    .toUpperCase();

                const card = document.createElement("div");
                card.className = "color-card";

                const swatch = document.createElement("div");
                swatch.className = "swatch";
                swatch.style.backgroundColor = hex;

                const info = document.createElement("div");
                info.className = "color-info";

                const hexText = document.createElement("div");
                hexText.className = "hex";
                hexText.textContent = hex;

                const rgbText = document.createElement("div");
                rgbText.className = "rgb";
                rgbText.textContent = `RGB(${r}, ${g}, ${b})`;

                const copyButton = document.createElement("button");
                copyButton.className = "copy-button";
                copyButton.textContent = "Salin HEX";

                copyButton.addEventListener("click", async () => {
                    try {
                        await navigator.clipboard.writeText(hex);
                        copyButton.textContent = "Tersalin!";
                    } catch {
                        status.textContent =
                            "Gagal menyalin. Salin kode ini secara manual: " + hex;
                    }
                });

                info.append(hexText, rgbText, copyButton);
                card.append(swatch, info);
                palette.appendChild(card);
            });

            paletteSection.hidden = false;
            status.textContent = `Berhasil menemukan ${colors.length} warna dominan.`;
        } catch (error) {
            console.error(error);
            status.textContent =
                "Gagal membaca warna. Pastikan library Color Thief berhasil dimuat.";
        }
    };

    preview.onerror = function () {
        status.textContent = "Gambar tidak dapat dibuka.";
    };

    preview.src = currentImageURL;
});