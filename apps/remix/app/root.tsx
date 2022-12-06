import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";
import clsx from "clsx";

import tailwindStylesheetUrl from "./styles/app.css";
import globalStyles from "./styles/reset.css";
import fontStyles from "./styles/font.css";
import { getUser } from "./utils/session.server";
import type { TrakrHandle } from "types";
import { getSplashScreenLinks } from "./splash-screen-links";

export const links: LinksFunction = () => {
  const splashScreenLinks = getSplashScreenLinks();
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: globalStyles },
    { rel: "stylesheet", href: fontStyles },
    { rel: "manifest", href: "/site.webmanifest" },
    ...splashScreenLinks,
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Transaction Tracker",
  description:
    "Everyone wants more financially. We are here to help you start! We do this by allowing you to keep track of your spending and being able to visualize your habits.",
  viewport: "width=device-width,initial-scale=1",
  "apple-mobile-web-app-status-bar-style": "black",
  "apple-mobile-web-app-capable": "yes",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  const matches = useMatches();
  let background: undefined | string = undefined;
  matches.forEach((match) => {
    if ((match.handle as TrakrHandle)?.backgroundColor) {
      background = (match.handle as TrakrHandle).backgroundColor;
    }
  });
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className={clsx("h-full", background)}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
