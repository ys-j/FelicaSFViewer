package works.ysj.felicasfviewer;

import android.nfc.tech.NfcF;
import android.webkit.JavascriptInterface;

import java.io.IOException;
import java.util.Base64;

public class NfcFJsInterfaces {
    private NfcF nfc = null;
    final Base64.Encoder encoder = Base64.getEncoder();
    final Base64.Decoder decoder = Base64.getDecoder();

    void apply(NfcF nfc) {
        this.nfc = nfc;
    }

    @JavascriptInterface
    public String transceive(String base64) throws IOException {
        try {
            nfc.connect();
            byte[] result = nfc.transceive(decoder.decode(base64));
            return encoder.encodeToString(result);
        } catch (Exception e) {
            return null;
        } finally {
            nfc.close();
        }
    }
}