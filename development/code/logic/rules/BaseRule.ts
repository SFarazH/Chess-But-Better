import { game } from '../../Game';
import { RuleLog } from '../../ui/logs/Log';

export interface Rule {
  description: string;
  isRevealed: boolean;
  condition: () => boolean;
  onTrigger: () => void;
  trigger: () => void;
}

export class BaseRule implements Rule {
  description: string;
  isRevealed: boolean;
  condition: () => boolean;
  onTrigger: () => void;

  constructor(
    description: string,
    isRevealed: boolean,
    condition: () => boolean,
    onTrigger: () => void,
  ) {
    this.description = description;
    this.isRevealed = isRevealed;
    this.condition = condition;
    this.onTrigger = onTrigger;
  }

  trigger() {
    if (this.condition()) {
      this.onTrigger();
      if (!this.isRevealed) {
        const player = game.getCurrentPlayer();
        new RuleLog(
          `${player.color} received XP for revealing a new rule: ${this.description}`,
        ).addToQueue();
        player.xp++;
        this.isRevealed = true;
      }
    }
  }
}
