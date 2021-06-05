import { Queryable } from 'tsbase/Collections/Queryable';
import { EventTypes } from 'fyord';

export type ControlConfig = {
  Key?: string,
  GamepadButtons?: number[],
  GamepadAxis?: { Axis: number, Positive: boolean }
};

export class Controller {
  private static instance: Controller | null = null;
  public static get Instance(): Controller { return this.instance || (this.instance = new Controller()); }
  public static Destroy(): void { this.instance = null; }

  private keyboard = {};
  private controlsMap = new Map<number, ControlConfig>();

  private get gamepad(): Gamepad | null {
    let gamepad: Gamepad | null = null;
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < 4; i++) {
      if (gamepads[i]) {
        gamepad = gamepads[i];
        break;
      }
    }

    return gamepad;
  }

  private constructor() {
    document.addEventListener(EventTypes.Keydown, (e: KeyboardEvent) => {
      this.keyboard[e.key] = 1;
    });

    document.addEventListener(EventTypes.Keyup, (e: KeyboardEvent) => {
      this.keyboard[e.key] = 0;
    });
  }

  public SetControls(controlsMap: Map<number, ControlConfig>): void {
    this.controlsMap = controlsMap;
  }

  public GetControlValue = (control: number): number => {
    let value = 0;
    const config = this.controlsMap.get(control);

    if (config) {
      const controllerValue = this.getControllerValue(config);
      const keyboardValue = this.getKeyBoardValue(config) || 0;

      value = Math.abs(controllerValue) > Math.abs(keyboardValue)
        ? controllerValue : keyboardValue;
    }

    return value;
  }

  private getKeyBoardValue(config: ControlConfig) {
    let keyboardValue = 0;

    if (config.Key) {
      keyboardValue = this.keyboard[config.Key];
    }
    return keyboardValue;
  }

  // eslint-disable-next-line complexity
  private getControllerValue(config: ControlConfig) {
    let controllerValue = 0;

    if (this.gamepad && config.GamepadAxis) {
      const positive = config.GamepadAxis.Positive;
      const axisValue = this.gamepad.axes[config.GamepadAxis.Axis];
      if (positive) {
        controllerValue = axisValue > 0 ? axisValue * -1 : 0;
      } else {
        controllerValue = axisValue < 0 ? axisValue : 0;
      }
    } else if (this.gamepad && config.GamepadButtons) {
      const values = this.gamepad.buttons
        .filter((_b, i) => config.GamepadButtons?.includes(i))
        .map(b => b.value);
      controllerValue = Queryable.From(values).Max();
    }

    return Math.abs(controllerValue);
  }
}
