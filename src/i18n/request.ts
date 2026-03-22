import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "ko"; // TODO: detect from URL/cookie later
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
