import { Elysia, ValidationError, t } from "elysia";
import { HeroLayout, HXLayout } from "../layouts/main";
import { htmx } from "elysia-htmx";
import { mapValidationError } from "../helpers";
import { addPlayer, plugin as statePlugin } from "../state"

interface FormProps {
  url?: string;
  nick?: string;
  fieldErrors: Record<string, string>;
}

const Form = ({ fieldErrors, nick, url }: FormProps) => {

  return (
    <form
      class="w-full max-w-md flex flex-col gap-4"
      hx-post="/signup"
      hx-target="this"
      hx-swap="outerHTML"
      hx-boost
    >
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">What is your nickname?</span>
        </div>
        <input
          type="text"
          name="nick"
          class="input input-bordered w-full max-w-xs"
          value={nick}
        />
        {fieldErrors['/nick'] ? (
          <div class="label-text-alt mt-2 text-error">
            {fieldErrors['/nick']}
          </div>
        ) : null}
      </label>
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">What is the URL of your server?</span>
        </div>
        <input
          type="text"
          name="url"
          class="input input-bordered w-full max-w-xs"
          value={url}
        />
        <label class="label-text-alt mt-2">
          For example: http://192.168.0.132:3000
        </label>
        {fieldErrors['/url'] ? (
          <div class="label-text-alt mt-2 text-error">
            {fieldErrors['/url']}
          </div>
        ) : null}
      </label>
      <button class="btn btn-primary">Sign Up</button>
    </form>
  );
};

export const plugin = new Elysia()
  .use(htmx())
  .use(statePlugin)
  .get("/signup", ({ hx }) => {
    const Layout = hx.isHTMX ? HXLayout : HeroLayout;

    return (
      <Layout page="Sign Up">
        <Form fieldErrors={{}} />
      </Layout>
    );
  })
  .post(
    "/signup",
    ({ body: {nick, url}, hx, set, store: { state } }) => {
      const fieldErrors: Record<string, string> = {};

      console.log('Players', state.players)

      if(state.players.find(p => p.nick === nick)) {
        fieldErrors['/nick'] = "Nickname already taken";
      }
      if(state.players.find(p => p.url === url)) {
        fieldErrors['/url'] = "Player with URL already exists";
      }

      // If field errors not empty, return Form with errors
      if(Object.keys(fieldErrors).length) {
        set.status = 400;
        const Layout = hx.isHTMX ? HXLayout : HeroLayout;
        return (
          <Layout page="Sign Up">
            <Form fieldErrors={fieldErrors} nick={nick} url={url} />
          </Layout>
        );
      }

      const uuid = addPlayer(state, { nick, url });
      if (hx.isHTMX) {
        hx.redirect(`/players/${uuid}`);
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
          pattern: "(http|https):\/\/(([a-zA-Z0-9-\.]+)|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(?::(\d+))?",
          default: "http://localhost:3000",
          errorMessage: "Should be a valid host URI with scheme, hostname/ip, and optionally a port",
        }),
      }),
      error: ({ code, error, hx, set, body: { nick, url } }) => {
        const Layout = hx.isHTMX ? HXLayout : HeroLayout;
        if (code === "VALIDATION") {
          set.status = 200;
          const errors = mapValidationError(error as ValidationError);
          return (
            <Layout page="Sign Up">
              <Form fieldErrors={errors} nick={nick} url={url} />
            </Layout>
          );
        } else {
          return (
            <Layout page="Sign Up">
              <Form fieldErrors={{}} nick={nick} url={url} />
            </Layout>
          )
        }
      },
    }
  );