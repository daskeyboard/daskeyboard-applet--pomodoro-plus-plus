const { FocusCycleTimer } = require("../index"); // adjust path if needed

// Mock Das Keyboard SDK
jest.mock("daskeyboard-applet", () => {
  return {
    logger: { info: jest.fn() },
    Signal: class {
      constructor({ points, name, message }) {
        this.points = points;
        this.name = name;
        this.message = message;
      }
    },
    Point: class {
      constructor(color, effect) {
        this.color = color;
        this.effect = effect;
      }
    },
    DesktopApp: class {},
  };
});

describe("FocusCycleTimer", () => {
  let applet;

  beforeEach(() => {
    applet = new FocusCycleTimer();
    applet.config = {
      workDuration: 1, // 1 minute
      breakDuration: 1, // 1 minute
    };
  });

  test("initializes remainingTime and currentCycle on first run", async () => {
    expect(applet.remainingTime).toBeNull();
    const signal = await applet.run();
    expect(applet.remainingTime).toBe(60); // 1 * 60
    expect(applet.currentCycle).toBe("work");
    expect(signal.message).toBe("Time to work!");
  });

  test("transitions from work to break after time runs out", async () => {
    await applet.run(); // initialize
    applet.remainingTime = 0.5; // simulate near-expiration
    const signal = await applet.run(); // should now switch
    expect(applet.currentCycle).toBe("break");
    expect(signal.message).toBe("Time for a break!");
  });

  test("transitions from break to work after time runs out", async () => {
    await applet.run(); // initialize
    applet.currentCycle = "break";
    applet.remainingTime = 0.5; // simulate near-expiration
    const signal = await applet.run(); // should now switch
    expect(applet.currentCycle).toBe("work");
    expect(signal.message).toBe("Time to work!");
  });

  test("throws error for invalid config", async () => {
    applet.config = { workDuration: 0, breakDuration: 5 };
    await expect(applet.run()).rejects.toThrow(
      "Invalid work or break duration"
    );
  });
});
