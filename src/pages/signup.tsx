import { type ValidationError, t } from "elysia";
import { mapValidationError } from "../helpers";
import { HTMLLayout, HXLayout, HeroLayout } from "../layouts/main";
import { addPlayer, plugin as statePlugin } from "../state";
import { basePluginSetup } from "../plugins";

interface FormProps {
  url?: string;
  nick?: string;
  fieldErrors: Record<string, string>;
}

const Form = ({ fieldErrors, nick, url }: FormProps) => {
  return (
    <div class="epic flex flex-col justify-center grow items-center">
      <form
        class="rounded-2xl z-10 bg-base-100 p-8 bg-opacity-80 backdrop-blur-sm w-full max-w-md flex flex-col items-stretch gap-4"
        hx-post="/signup"
        hx-target="#main"
        hx-swap="innerHTML"
        hx-boost
      >
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">What is your nickname?</span>
          </div>
          <input
            type="text"
            name="nick"
            class="input input-bordered w-full"
            value={nick}
          />
          {fieldErrors["/nick"] ? (
            <div class="label-text-alt mt-2 text-error" safe>
              {fieldErrors["/nick"]}
            </div>
          ) : null}
        </label>
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">What is the URL of your server?</span>
          </div>
          <input
            type="text"
            name="url"
            class="input input-bordered w-full"
            value={url}
          />
          <label class="label-text-alt mt-2">
            For example: http://192.168.0.132:3000
          </label>
          {fieldErrors["/url"] ? (
            <div class="label-text-alt mt-2 text-error" safe>
              {fieldErrors["/url"]}
            </div>
          ) : null}
        </label>
        <button type="submit" class="btn btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export const plugin = basePluginSetup()
  .get("/signup", ({ htmx }) => {
    const Layout = htmx.is ? HXLayout : HTMLLayout;

    return (
      <Layout page="Sign Up">
        <Form fieldErrors={{}} />
      </Layout>
    );
  })
  .post(
    "/signup",
    ({ body: { nick, url }, htmx, set, store: { state } }) => {
      const fieldErrors: Record<string, string> = {};

      if (state.players.find((p) => p.nick === nick)) {
        fieldErrors["/nick"] = "Nickname already taken";
      }
      if (state.players.find((p) => p.url === url)) {
        fieldErrors["/url"] = "Player with URL already exists";
      }

      // If field errors not empty, return Form with errors
      if (Object.keys(fieldErrors).length) {
        set.status = 400;
        const Layout = htmx.is ? HXLayout : HTMLLayout;
        return (
          <Layout page="Sign Up">
            <Form fieldErrors={fieldErrors} nick={nick} url={url} />
          </Layout>
        );
      }

      const uuid = addPlayer(state, { nick, url });
      if (htmx.is) {
        htmx.redirect(`/players/${uuid}`);
      } else {
        set.redirect = `/players/${uuid}`;
      }
    },
    {
      body: t.Object({
        nick: t.String({
          minLength: 3,
          maxLength: 20,
        }),
        url: t.String({
          pattern:
            "(http|https)://(([a-zA-Z0-9-.]+)|(d{1,3}.d{1,3}.d{1,3}.d{1,3}))(?::(d+))?",
          default: "http://localhost:3000",
          errorMessage:
            "Should be a valid host URI with scheme, hostname/ip, and optionally a port",
        }),
      }),
      error: ({ code, error, htmx, set, body: { nick, url } }) => {
        const Layout = htmx.is ? HXLayout : HeroLayout;
        if (code === "VALIDATION") {
          set.status = 200;
          const errors = mapValidationError(error as ValidationError);
          return (
            <Layout page="Sign Up">
              <Form fieldErrors={errors} nick={nick} url={url} />
            </Layout>
          );
        }
        return (
          <Layout page="Sign Up">
            <Form fieldErrors={{}} nick={nick} url={url} />
          </Layout>
        );
      },
    }
  );
