import { DOMAIN_MAP, DOMAIN_OWNERSHIP, FILE_LOCATION_GUIDE } from './validators/rules';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class PreCommitValidator {
  static validateFileLocation(filePath: string): ValidationResult {
    const errors: string[] = [];
    
    // Check file location against rules
    Object.entries(FILE_LOCATION_GUIDE).forEach(([type, guide]) => {
      if (filePath.includes(type) && !filePath.startsWith(guide.location)) {
        errors.push(`File ${filePath} should be in ${guide.location}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateOwnership(filePath: string, author: string): ValidationResult {
    const errors: string[] = [];
    
    // Check ownership permissions
    Object.entries(DOMAIN_OWNERSHIP).forEach(([domain, rules]) => {
      if (filePath.includes(domain.toLowerCase())) {
        if (!rules.canModify.includes(author)) {
          errors.push(`${author} does not have permission to modify ${domain}`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateTypeScript(filePath: string): ValidationResult {
    // TypeScript validation would be implemented here
    return {
      valid: true,
      errors: []
    };
  }

  static async validateCommit(files: string[], author: string): Promise<ValidationResult> {
    const errors: string[] = [];
    
    for (const file of files) {
      // Validate file location
      const locationResult = this.validateFileLocation(file);
      errors.push(...locationResult.errors);
      
      // Validate ownership
      const ownershipResult = this.validateOwnership(file, author);
      errors.push(...ownershipResult.errors);
      
      // Validate TypeScript
      const tsResult = this.validateTypeScript(file);
      errors.push(...tsResult.errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}