import { Elysia, t } from "elysia";
import { htmx } from "elysia-htmx";

import { plugin as statePlugin, Player } from "../state";
import { FullScreenLayout, HXLayout } from "../layouts/main";



const Player = (player: Player) => {
  return (
    <>
      <nav class="">
        <h1>{player.nick}</h1>
      </nav>
      <div class="overflow-x-auto w-full h-full">
        <table class="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Question</th>
              <th>Answer</th>
              <th>HTTP Status Code</th>
              <th>Points</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{new Date().toLocaleTimeString()}</th>
              <td>What is 1 + 3</td>
              <td>
                <span></span>
              </td>
              <td>
                <span></span>
              </td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <th>{new Date().toLocaleTimeString()}</th>
              <td>What is 1 + 3</td>
              <td>
                <span></span>
              </td>
              <td>
                <span class="text-error">500</span>
              </td>
              <td>-10</td>
              <td>0</td>
            </tr>
            <tr>
              <th>{new Date().toLocaleTimeString()}</th>
              <td>What is 1 + 3</td>
              <td>
                <span class="text-success">4</span>
              </td>
              <td>
                <span class="text-success">200</span>
              </td>
              <td>10</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export const plugin = new Elysia()
  .use(htmx())
  .use(statePlugin)
  .get(
    "/players/:uuid",
    ({ hx, params: { uuid }, store: { state } }) => {
      const Layout = hx.isHTMX ? HXLayout : FullScreenLayout;
      console.log("Players", state.players);
      const player = state.players.find((p) => p.uuid === uuid);

      if (!player) {
        return (
          <Layout page="User">
            <div class="flex flex-col">
              <h1 class="">Player not found</h1>
              <p>
                <a class="link link-success" href="/signup">
                  Create a new player
                </a>{" "}
                to compete.
              </p>
            </div>
          </Layout>
        );
      }
      return (
        <Layout page="User">
          <Player {...player} />
        </Layout>
      );
    },
    {
      params: t.Object({
        uuid: t.String(),
      }),
    }
  );
