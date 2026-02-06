import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";

export const { dataProvider, kyInstance } = createSimpleRestDataProvider({
	apiURL: API_URL,
});

kyInstance.extend({
	hooks: {
		beforeRequest: [
			(request) => {
				const auth = localStorage.getItem("kivi-auth");
				if (auth) {
					const { access_token } = JSON.parse(auth);
					request.headers.set("Authorization", `Bearer ${access_token}`);
				}
			},
		],
	},
});
