const q = require("daskeyboard-applet");
const logger = q.logger;

class PomodoroTimer extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 30000; // every 30 seconds
    this.remainingTime = null;
    this.currentCycle = "work";

    logger.info("Pomodoro Timer ready to launch");
  }

  generateSignal(currentCycle) {
    logger.info("==============================");
    logger.info(
      `Current Cycle: ${currentCycle}, remainingTime: ${this.remainingTime}`
    );
    logger.info("==============================");
    let color;
    let message;
    let effect;
    if (currentCycle === "work") {
      color = "#0088FF"; // blue for work
      message = "Time to work!";
      effect = "BREATHE";
    } else {
      color = "#00FF00"; // green for break
      message = "Time for a break!";
      effect = "BLINK";
    }

    return new q.Signal({
      points: [[new q.Point(color, effect)]],
      name: "Pomodoro Timer",
      message: message,
    });
  }

  async run() {
    if (this.config.workDuration <= 0 || this.config.breakDuration <= 0) {
      throw new Error(
        "Invalid work or break duration. Please enter positive numbers."
      );
    }

    if (this.remainingTime !== null) {
      this.remainingTime -= this.pollingInterval / 1000; // convert milliseconds to seconds
      if (this.remainingTime <= 0) {
        if (this.currentCycle === "work") {
          this.currentCycle = "break";
          this.remainingTime = this.config.breakDuration * 60; // reset to break duration
        } else {
          this.currentCycle = "work";
          this.remainingTime = this.config.workDuration * 60; // reset to work duration
        }
      }
    } else {
      this.remainingTime = this.config.workDuration * 60; // convert minutes to seconds
      this.currentCycle = "work"; // start with work cycle
    }

    return this.generateSignal(this.currentCycle);
  }
}

module.exports = { PomodoroTimer: PomodoroTimer };
const applet = new PomodoroTimer();
