
export enum ComplexityEnum {
  STRONG = "strong",
  MEDIUM = "medium",
  WEAK = "weak",
  EMPTY = "empty"
}

const complexities = {
  strong: new RegExp(
    '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'
  ),
  medium: new RegExp(
    '((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))'
  )
};

class PasswordComplexity {
  _password: string = '';
  _currentComplexity: ComplexityEnum = ComplexityEnum.EMPTY;

  updatePassword(password: string) {
    this._password = password;
    this._checkComplexity();
  }

  _checkComplexity = (): void => {
    if (this._password.length === 0) {
      this._currentComplexity = ComplexityEnum.EMPTY;
    } else if (this._password.match(complexities.strong)) {
      this._currentComplexity = ComplexityEnum.STRONG;
    } else if (this._password.match(complexities.medium)) {
      this._currentComplexity = ComplexityEnum.MEDIUM;
    } else {
      this._currentComplexity = ComplexityEnum.WEAK;
    }
  };

  getAlertText = (): string => {
    switch (this._currentComplexity) {
      case ComplexityEnum.STRONG:
        return 'Strong';
      case ComplexityEnum.MEDIUM:
        return 'Medium';
      case ComplexityEnum.WEAK:
        return 'Weak';
      case ComplexityEnum.EMPTY:
      default:
        return '';
    }
  };

  getComplexity = (): ComplexityEnum => {
    return this._currentComplexity;
  };
};

export default PasswordComplexity;
