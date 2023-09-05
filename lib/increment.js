class Increment {
  constructor() {

  }

  getIncrement() {
    if (!this.nextNumber) this.nextNumber = 1;
    else this.nextNumber++;
    return this.nextNumber;
  }
}

module.exports = Increment;
