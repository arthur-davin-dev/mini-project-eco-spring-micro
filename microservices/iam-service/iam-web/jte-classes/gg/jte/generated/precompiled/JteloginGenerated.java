package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JteloginGenerated {
	public static final String JTE_NAME = "login.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,11,11,11,11,11,11,11,11,11,15,15,15,21,21,21,27,27,27,28,28,28,30,30,31,31,31,32,32,33,33,34,34,34,35,35,36,36,37,37,37,38,38,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,41,44,44,44,48,48,48,52,52,52,55,55,55,57,57,59,59,59,61,61,63,63,64,64,66,66,67,67,69,69,70,70,72,72,74,74,77,0,0,0,1,2,3,4,5,6,7,8,9,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, boolean githubEnabled, boolean googleEnabled, boolean facebookEnabled, boolean telegramEnabled, boolean oauthError, boolean registered, boolean badCredentials, org.springframework.security.web.csrf.CsrfToken csrf) {
		jteOutput.writeContent("<!doctype html>\n<html");
		var __jte_html_attribute_0 = currentLanguage;
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_0)) {
			jteOutput.writeContent(" lang=\"");
			jteOutput.setContext("html", "lang");
			jteOutput.writeUserContent(__jte_html_attribute_0);
			jteOutput.setContext("html", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n<head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <title>");
		jteOutput.setContext("title", null);
		jteOutput.writeUserContent(i18n.get("login.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.appName"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("login.title"));
		jteOutput.writeContent("</h1>\n    <p>");
		jteOutput.setContext("p", null);
		jteOutput.writeUserContent(i18n.get("login.subtitle"));
		jteOutput.writeContent("</p>\n\n    ");
		if (oauthError) {
			jteOutput.writeContent("\n        <p class=\"error\" role=\"alert\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("login.oauthError"));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (registered) {
			jteOutput.writeContent("\n        <p class=\"success\" role=\"status\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("login.registered"));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (badCredentials) {
			jteOutput.writeContent("\n        <p class=\"error\" role=\"alert\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("login.badCredentials"));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n\n    <form method=\"post\" action=\"/login\">\n        <input type=\"hidden\"");
		var __jte_html_attribute_1 = csrf.getParameterName();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_1)) {
			jteOutput.writeContent(" name=\"");
			jteOutput.setContext("input", "name");
			jteOutput.writeUserContent(__jte_html_attribute_1);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		var __jte_html_attribute_2 = csrf.getToken();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_2)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_2);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("login.username"));
		jteOutput.writeContent("\n            <input name=\"username\" autocomplete=\"username\" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("login.password"));
		jteOutput.writeContent("\n            <input type=\"password\" name=\"password\" autocomplete=\"current-password\" required>\n        </label>\n\n        <button>");
		jteOutput.setContext("button", null);
		jteOutput.writeUserContent(i18n.get("login.signIn"));
		jteOutput.writeContent("</button>\n    </form>\n\n    <p><a href=\"/register\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("login.register"));
		jteOutput.writeContent("</a></p>\n\n    ");
		if (githubEnabled || googleEnabled || facebookEnabled || telegramEnabled) {
			jteOutput.writeContent("\n        <hr>\n        <p>");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("login.orContinue"));
			jteOutput.writeContent("</p>\n        <div class=\"actions\">\n            ");
			if (githubEnabled) {
				jteOutput.writeContent("\n                <a class=\"button\" href=\"/oauth2/authorization/github\">GitHub</a>\n            ");
			}
			jteOutput.writeContent("\n            ");
			if (googleEnabled) {
				jteOutput.writeContent("\n                <a class=\"button\" href=\"/oauth2/authorization/google\">Google</a>\n            ");
			}
			jteOutput.writeContent("\n            ");
			if (facebookEnabled) {
				jteOutput.writeContent("\n                <a class=\"button\" href=\"/oauth2/authorization/facebook\">Facebook</a>\n            ");
			}
			jteOutput.writeContent("\n            ");
			if (telegramEnabled) {
				jteOutput.writeContent("\n                <a class=\"button\" href=\"/oauth2/authorization/telegram\">Telegram</a>\n            ");
			}
			jteOutput.writeContent("\n        </div>\n    ");
		}
		jteOutput.writeContent("\n</main>\n</body>\n</html>");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		boolean githubEnabled = (boolean)params.get("githubEnabled");
		boolean googleEnabled = (boolean)params.get("googleEnabled");
		boolean facebookEnabled = (boolean)params.get("facebookEnabled");
		boolean telegramEnabled = (boolean)params.get("telegramEnabled");
		boolean oauthError = (boolean)params.get("oauthError");
		boolean registered = (boolean)params.get("registered");
		boolean badCredentials = (boolean)params.get("badCredentials");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, githubEnabled, googleEnabled, facebookEnabled, telegramEnabled, oauthError, registered, badCredentials, csrf);
	}
}
