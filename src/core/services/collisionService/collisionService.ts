import { Queryable } from 'tsbase/Collections/Queryable';
import { Character } from '../../character/character';

export class CollisionService {
  private static instance: CollisionService | null = null;
  public static get Instance(): CollisionService { return this.instance || (this.instance = new CollisionService()); }
  public static Destroy(): void { this.instance = null; }

  private constructor() { }

  public DetectCollisions = (characters: Array<Character>): void => {
    characters.filter(c => !!c.Element && c.HitBox).forEach(character => {
      const otherCharacters = characters.filter(c => c.Id !== character.Id);
      const charactersCollidedWith = otherCharacters.filter(oc => this.charactersAreColliding(character, oc));

      charactersCollidedWith.forEach(characterCollidedWith => {
        character.Collision.Publish(characterCollidedWith);
      });
    });
  }

  // eslint-disable-next-line complexity
  private charactersAreColliding = (c1: Character, c2: Character): boolean => {
    const c1Points = c1.GetHitPoints();
    const c2Bounds = c2.GetCharacterBounds();

    if (c1.HitBox && c2.HitBox && c2.HitBox.radius) {
      const radius = c2.HitBox.radius;
      const offset = c2.HitBox ? c2.HitBox.offset : 0;

      return Queryable.From(c1Points).Any(c1p =>
        Math.sqrt(
          this.squared(c1p.x - (c2.Position.x + radius)) + this.squared(c1p.y - (c2.Position.y + radius)))
        < radius + offset);
    } else if (c1.HitBox && c2.HitBox && c2Bounds) {
      return Queryable.From(c1Points).Any(c1p =>
        c1p.x >= c2Bounds.xBounds.l &&
        c1p.x <= c2Bounds.xBounds.r &&
        c1p.y <= c2Bounds.yBounds.t &&
        c1p.y >= c2Bounds.yBounds.b);
    } else {
      return false;
    }
  }

  private squared(number: number): number {
    return number * number;
  }
}
