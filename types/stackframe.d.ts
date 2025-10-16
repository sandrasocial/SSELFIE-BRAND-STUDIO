declare module '@stackframe/react' {
  export class StackServerApp {
    constructor(config: {
      projectId: string;
      publishableClientKey: string;
      secretServerKey: string;
      tokenStore: "cookie";
      urls: {
        signIn: string;
        signUp: string;
        afterSignIn: string;
        afterSignUp: string;
        afterSignOut: string;
      };
    });

    projectId: string;
    urls: {
      signIn: string;
      signUp: string;
      afterSignIn: string;
      afterSignUp: string;
      afterSignOut: string;
    };
  }
}