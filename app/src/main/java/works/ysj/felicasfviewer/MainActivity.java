package works.ysj.felicasfviewer;

import android.app.Activity;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.tech.NfcF;
import android.os.Bundle;
import android.webkit.WebMessage;
import android.webkit.WebView;

public class MainActivity extends Activity {
	private final String origin = "https://felicasfviewer.ysj.works";
	private final String url = origin + "/view.html";

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		WebView webView = findViewById(R.id.webview);
		NfcFJsInterfaces interfaces = new NfcFJsInterfaces();
		webView.getSettings().setJavaScriptEnabled(true);
		webView.addJavascriptInterface(interfaces, "NfcF");
		webView.loadUrl(url);

		NfcAdapter adapter = NfcAdapter.getDefaultAdapter(this);
		adapter.enableReaderMode(this, tag -> {
			webView.post(() -> {
				NfcF nfc = NfcF.get(tag);
				String id = interfaces.encoder.encodeToString(tag.getId());
				interfaces.apply(nfc);
				webView.postWebMessage(new WebMessage(id), Uri.parse(origin));
			});
		}, NfcAdapter.FLAG_READER_NFC_F, null);
	}
}