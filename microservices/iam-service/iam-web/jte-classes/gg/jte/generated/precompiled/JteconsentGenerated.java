package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JteconsentGenerated {
	public static final String JTE_NAME = "consent.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,9,9,9,9,9,9,9,9,9,13,13,13,19,19,19,25,25,25,27,27,28,28,28,29,29,29,30,30,31,31,31,31,31,31,32,32,32,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,36,36,36,36,36,36,36,36,36,37,37,37,37,37,37,37,37,37,39,39,40,40,40,41,41,42,42,44,44,44,44,44,44,44,44,44,45,45,45,47,47,49,49,49,50,50,50,52,52,56,0,0,0,1,2,3,4,5,6,7,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, org.springframework.security.web.csrf.CsrfToken csrf, String clientId, String clientName, String state, java.util.List<String> scopes, String errorKey) {
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
		jteOutput.writeUserContent(i18n.get("consent.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.appName"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("consent.title"));
		jteOutput.writeContent("</h1>\n\n    ");
		if (errorKey != null) {
			jteOutput.writeContent("\n        <p class=\"error\" role=\"alert\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(errorKey));
			jteOutput.writeContent("</p>\n        <a class=\"button\" href=\"/\">");
			jteOutput.setContext("a", null);
			jteOutput.writeUserContent(i18n.get("common.home"));
			jteOutput.writeContent("</a>\n    ");
		} else {
			jteOutput.writeContent("\n        <p><b>");
			jteOutput.setContext("b", null);
			jteOutput.writeUserContent(i18n.get("consent.client"));
			jteOutput.writeContent(":</b> ");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(clientName);
			jteOutput.writeContent("</p>\n        <p>");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("consent.requestedScopes"));
			jteOutput.writeContent("</p>\n\n        <form method=\"post\" action=\"/oauth2/authorize\">\n            <input type=\"hidden\"");
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
			jteOutput.writeContent(">\n            <input type=\"hidden\" name=\"client_id\"");
			var __jte_html_attribute_3 = clientId;
			if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_3)) {
				jteOutput.writeContent(" value=\"");
				jteOutput.setContext("input", "value");
				jteOutput.writeUserContent(__jte_html_attribute_3);
				jteOutput.setContext("input", null);
				jteOutput.writeContent("\"");
			}
			jteOutput.writeContent(">\n            <input type=\"hidden\" name=\"state\"");
			var __jte_html_attribute_4 = state;
			if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_4)) {
				jteOutput.writeContent(" value=\"");
				jteOutput.setContext("input", "value");
				jteOutput.writeUserContent(__jte_html_attribute_4);
				jteOutput.setContext("input", null);
				jteOutput.writeContent("\"");
			}
			jteOutput.writeContent(">\n\n            ");
			if (scopes.isEmpty()) {
				jteOutput.writeContent("\n                <p>");
				jteOutput.setContext("p", null);
				jteOutput.writeUserContent(i18n.get("consent.noScopes"));
				jteOutput.writeContent("</p>\n            ");
			}
			jteOutput.writeContent("\n            ");
			for (var scope : scopes) {
				jteOutput.writeContent("\n                <label class=\"check\">\n                    <input type=\"checkbox\" name=\"scope\"");
				var __jte_html_attribute_5 = scope;
				if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_5)) {
					jteOutput.writeContent(" value=\"");
					jteOutput.setContext("input", "value");
					jteOutput.writeUserContent(__jte_html_attribute_5);
					jteOutput.setContext("input", null);
					jteOutput.writeContent("\"");
				}
				jteOutput.writeContent(" checked>\n                    ");
				jteOutput.setContext("label", null);
				jteOutput.writeUserContent(scope);
				jteOutput.writeContent("\n                </label>\n            ");
			}
			jteOutput.writeContent("\n\n            <button name=\"user_oauth_approval\" value=\"true\">");
			jteOutput.setContext("button", null);
			jteOutput.writeUserContent(i18n.get("consent.allow"));
			jteOutput.writeContent("</button>\n            <button class=\"secondary\" name=\"user_oauth_approval\" value=\"false\">");
			jteOutput.setContext("button", null);
			jteOutput.writeUserContent(i18n.get("consent.cancel"));
			jteOutput.writeContent("</button>\n        </form>\n    ");
		}
		jteOutput.writeContent("\n</main>\n</body>\n</html>\n");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String clientId = (String)params.get("clientId");
		String clientName = (String)params.get("clientName");
		String state = (String)params.get("state");
		java.util.List<String> scopes = (java.util.List<String>)params.get("scopes");
		String errorKey = (String)params.get("errorKey");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, csrf, clientId, clientName, state, scopes, errorKey);
	}
}
