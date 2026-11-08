package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JtechangepasswordGenerated {
	public static final String JTE_NAME = "change-password.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,10,10,10,16,16,16,22,22,22,24,24,25,25,25,26,26,27,27,28,28,28,29,29,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,35,35,35,39,39,39,43,43,43,47,47,47,51,0,0,0,1,2,3,4,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, org.springframework.security.web.csrf.CsrfToken csrf, String successKey, String errorKey) {
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
		jteOutput.writeUserContent(i18n.get("password.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.home"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("password.title"));
		jteOutput.writeContent("</h1>\n\n    ");
		if (successKey != null) {
			jteOutput.writeContent("\n        <p class=\"success\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(successKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (errorKey != null) {
			jteOutput.writeContent("\n        <p class=\"error\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(errorKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n\n    <form method=\"post\" action=\"/profile/password\">\n        <input type=\"hidden\"");
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
		jteOutput.writeUserContent(i18n.get("password.current"));
		jteOutput.writeContent("\n            <input type=\"password\" name=\"currentPassword\" autocomplete=\"current-password\" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("password.new"));
		jteOutput.writeContent("\n            <input type=\"password\" name=\"newPassword\" autocomplete=\"new-password\" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("password.confirm"));
		jteOutput.writeContent("\n            <input type=\"password\" name=\"confirmPassword\" autocomplete=\"new-password\" required>\n        </label>\n\n        <button>");
		jteOutput.setContext("button", null);
		jteOutput.writeUserContent(i18n.get("password.submit"));
		jteOutput.writeContent("</button>\n    </form>\n</main>\n</body>\n</html>");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String successKey = (String)params.get("successKey");
		String errorKey = (String)params.get("errorKey");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, csrf, successKey, errorKey);
	}
}
