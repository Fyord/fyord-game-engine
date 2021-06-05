import { GameLoop } from 'tsbase/Utility/Timers/GameLoop';
import { Observable } from 'tsbase/Patterns/Observable/Observable';
import { App } from 'fyord';
import { CollisionService } from '../services/collisionService/collisionService';
import { MapStyles } from '../../enums/mapStyles';
import { Character } from '../character/character';

export class Game {
  public static TargetFramerate = 60;
  private static instance: Game | null = null;
  public static get Instance(): Game { return this.instance || (this.instance = new Game()); }
  public static Destroy(): void { this.instance = null; }

  public GameLoop = new GameLoop();
  public GlobalEvent = new Observable<any>();
  public PlayerControls = new Observable<any>();
  public CollisionEvent = new Observable<any>();
  public Paused = new Observable<boolean>();
  public MapBounds = {
    minX: 0,
    minY: 0,
    maxX: innerWidth,
    maxY: innerHeight
  };
  private characters = new Array<Character>();
  public get Characters(): Array<Character> {
    return this.characters = this.characters.filter(c => !!c.Element);
  }
  private paused = false;

  private constructor(
    public MapStyle = MapStyles.Wrapping,
    private collisionService = CollisionService.Instance,
    private app = App.Instance()
  ) {
    this.GameLoop.GameEvents = [
      this.GlobalEvent,
      this.PlayerControls,
      this.CollisionEvent
    ];

    this.CollisionEvent.Subscribe(() => {
      this.collisionService.DetectCollisions(this.Characters);
    });

    this.app.Router.Route.Subscribe(async () => {
      this.app.Main.style.width = `${this.MapBounds.maxX}px`;
      this.app.Main.style.height = `${this.MapBounds.maxY}px`;
    });
  }

  public Animation = (immediate: () => void, delayed: () => void, milliseconds: number, pausing = true): void => {
    if (pausing) {
      this.PlayerControls.Discontinue();
      this.CollisionEvent.Discontinue();
    }

    immediate();

    setTimeout(() => {
      delayed();

      if (pausing && !this.paused) {
        this.resume();
      }
    }, milliseconds);
  }

  public TogglePause = (): void => {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  private pause = (): void => {
    this.PlayerControls.Discontinue();
    this.CollisionEvent.Discontinue();
    this.paused = true;
    this.Paused.Publish(true);
  }

  private resume = (): void => {
    this.PlayerControls.Reinstate();
    this.CollisionEvent.Reinstate();
    this.paused = false;
    this.Paused.Publish(false);
  }
}
