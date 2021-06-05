import { Strings } from 'tsbase/Functions/Strings';
import { Observable } from 'tsbase/Patterns/Observable/Observable';
import { Asap, Component } from 'fyord';
import { HitBox, Position, Size, StartingSizeAndPosition } from '../../types/module';
import { MapStyles } from '../../enums/mapStyles';
import { CollisionService } from '../services/collisionService/collisionService';
import { Game } from '../game/game';

export abstract class Character extends Component {
  public CharacterType = Strings.Empty;
  public HitBox: HitBox = null;
  public Collision = new Observable<Character>();

  private angle: number = 0;
  public get Angle(): number {
    return this.angle;
  }
  public set Angle(v: number) {
    this.angle = v;
    this.Element!.style.transform = `rotate(${v}deg)`;
  }

  private size: Size = { height: 0, width: 0 };
  public get Size(): Size {
    return this.size;
  }
  public set Size(v: Size) {
    this.size = v;
    this.Element!.style.height = `${v.height}px`;
    this.Element!.style.width = `${v.width}px`;
  }

  private position: Position = { x: 0, y: 0 };
  public get Position(): Position {
    return this.position;
  }
  // eslint-disable-next-line complexity
  public set Position(v: Position) {
    const mapBounds = Game.Instance.MapBounds;
    const offset = this.Size.width > this.Size.height ? this.Size.width : this.Size.height;
    let newX = v.x;
    let newY = v.y;

    if (this.game.MapStyle === MapStyles.Fixed) {
      if (v.x < mapBounds.minX) {
        newX = mapBounds.minX;
      } else if (v.x > mapBounds.maxX - offset) {
        newX = mapBounds.maxX - offset;
      }
    } else if (this.game.MapStyle === MapStyles.Wrapping) {
      if (v.x < mapBounds.minX - offset) {
        newX = mapBounds.maxX;
      } else if (v.x > mapBounds.maxX) {
        newX = mapBounds.minX - offset;
      }
    }

    this.position.x = newX;
    this.Element!.style.left = `${newX}px`;

    if (this.game.MapStyle === MapStyles.Fixed) {
      if (v.y < mapBounds.minY) {
        newY = mapBounds.minY;
      } else if (v.y > mapBounds.maxY - offset) {
        newY = mapBounds.maxY - offset;
      }
    } else if (this.game.MapStyle === MapStyles.Wrapping) {
      if (v.y < mapBounds.minY - offset) {
        newY = mapBounds.maxY;
      } else if (v.y > mapBounds.maxY) {
        newY = mapBounds.minY - offset;
      }
    }

    this.position.y = newY;
    this.Element!.style.top = `${newY}px`;
  }

  constructor(
    startingSizeAndPosition?: StartingSizeAndPosition,
    protected game = Game.Instance,
    protected utility = CollisionService.Instance
  ) {
    super();

    Asap(() => {
      this.game.Characters.push(this);
      this.Element!.style.position = 'absolute';
      this.Size = { width: this.intOrDefault(startingSizeAndPosition?.width), height: this.intOrDefault(startingSizeAndPosition?.height) };
      this.Position = startingSizeAndPosition?.centered ?
        {
          x: (this.game.MapBounds.maxX / 2) - (this.Size.width / 2),
          y: (this.game.MapBounds.maxY / 2) - (this.Size.height / 2)
        } :
        { x: this.intOrDefault(startingSizeAndPosition?.xpos), y: this.intOrDefault(startingSizeAndPosition?.ypos) };
      this.Angle = this.intOrDefault(startingSizeAndPosition?.angle);
    });
  }

  public AddToLevel(mutation?: () => void): void {
    (async () => {
      if (!this.Element) {
        const element = document.createElement('div');
        element.innerHTML = await this.Render();
        const characterElement = element.firstChild as HTMLDivElement;
        characterElement.style.visibility = 'hidden';
        this.App.Main.appendChild(characterElement);
      }
    })();

    Asap(() => {
      this.Element!.style.visibility = 'visible';
      mutation?.();
    });
  }

  public GetHitPoints(): Array<Position> {
    return [
      { x: this.Position.x, y: this.Position.y }, // top left
      { x: this.Position.x + this.Size.width / 2, y: this.Position.y }, // top middle
      { x: this.Position.x + this.Size.width, y: this.Position.y }, // top right
      { x: this.Position.x, y: this.Position.y + this.Size.height / 2 }, // middle left
      { x: this.Position.x + this.Size.width / 2, y: this.Position.y + this.Size.height / 2 }, // middle middle
      { x: this.Position.x + this.Size.width, y: this.Position.y + this.Size.height / 2 }, // middle right
      { x: this.Position.x, y: this.Position.y + this.Size.height }, // bottom left
      { x: this.Position.x + this.Size.width / 2, y: this.Position.y + this.Size.height }, // bottom middle
      { x: this.Position.x + this.Size.width, y: this.Position.y + this.Size.height } // bottom right
    ];
  }

  public GetCharacterBounds(): { xBounds: { l: number, r: number }, yBounds: { b: number, t: number } } | null {
    return {
      xBounds: { l: this.Position.x, r: this.Position.x + this.Size.width },
      yBounds: { b: this.Position.y, t: this.Position.y + this.Size.height }
    };
  }

  private intOrDefault = (value?: number) => {
    return value || 0;
  }
}
