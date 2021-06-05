import { Page, RenderModes } from 'fyord';
import { Game } from '../game/game';

export abstract class Level extends Page {
  RenderMode = RenderModes.Dynamic;

  constructor(protected game = Game.Instance) {
    super();
  }
}
