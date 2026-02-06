import { AuthPage } from "@refinedev/antd";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: {
          email: "admin@kivisuites.com",
          password: "admin123",
        },
      }}
    />
  );
};
