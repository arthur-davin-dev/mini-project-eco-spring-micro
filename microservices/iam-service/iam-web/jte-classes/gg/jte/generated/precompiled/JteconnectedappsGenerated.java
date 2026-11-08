package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JteconnectedappsGenerated {
	public static final String JTE_NAME = "connected-apps.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,10,10,10,16,16,16,22,22,22,24,24,25,25,25,26,26,28,28,29,29,29,30,30,34,34,34,35,35,35,40,40,42,42,42,43,43,43,45,45,45,45,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,47,47,47,51,51,54,54,57,0,0,0,1,2,3,4,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, java.util.List<kh.eco.istad.iam.web.controller.ConnectedApplicationView> apps, org.springframework.security.web.csrf.CsrfToken csrf, String successKey) {
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
		jteOutput.writeUserContent(i18n.get("apps.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card wide\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.home"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("apps.title"));
		jteOutput.writeContent("</h1>\n\n    ");
		if (successKey != null) {
			jteOutput.writeContent("\n        <p class=\"success\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(successKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n\n    ");
		if (apps.isEmpty()) {
			jteOutput.writeContent("\n        <p>");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("common.empty"));
			jteOutput.writeContent("</p>\n    ");
		} else {
			jteOutput.writeContent("\n        <table>\n            <thead>\n            <tr>\n                <th>");
			jteOutput.setContext("th", null);
			jteOutput.writeUserContent(i18n.get("apps.client"));
			jteOutput.writeContent("</th>\n                <th>");
			jteOutput.setContext("th", null);
			jteOutput.writeUserContent(i18n.get("apps.scopes"));
			jteOutput.writeContent("</th>\n                <th></th>\n            </tr>\n            </thead>\n            <tbody>\n            ");
			for (var app : apps) {
				jteOutput.writeContent("\n                <tr>\n                    <td>");
				jteOutput.setContext("td", null);
				jteOutput.writeUserContent(app.clientName());
				jteOutput.writeContent("</td>\n                    <td>");
				jteOutput.setContext("td", null);
				jteOutput.writeUserContent(String.join(", ", app.scopes()));
				jteOutput.writeContent("</td>\n                    <td>\n                        <form method=\"post\" action=\"/profile/apps/");
				jteOutput.setContext("form", "action");
				jteOutput.writeUserContent(app.registeredClientId());
				jteOutput.setContext("form", null);
				jteOutput.writeContent("/revoke\">\n                            <input type=\"hidden\"");
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
				jteOutput.writeContent(">\n                            <button class=\"danger\">");
				jteOutput.setContext("button", null);
				jteOutput.writeUserContent(i18n.get("apps.revoke"));
				jteOutput.writeContent("</button>\n                        </form>\n                    </td>\n                </tr>\n            ");
			}
			jteOutput.writeContent("\n            </tbody>\n        </table>\n    ");
		}
		jteOutput.writeContent("\n</main>\n</body>\n</html>");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		java.util.List<kh.eco.istad.iam.web.controller.ConnectedApplicationView> apps = (java.util.List<kh.eco.istad.iam.web.controller.ConnectedApplicationView>)params.get("apps");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String successKey = (String)params.get("successKey");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, apps, csrf, successKey);
	}
}
