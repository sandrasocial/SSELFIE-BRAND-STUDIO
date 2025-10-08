/**
 * 🎯 VERTICAL SLICE ARCHITECTURE VALIDATION
 * Validates that all components of the Maya image generation pipeline exist and are properly integrated
 */

import fs from 'fs';
import path from 'path';

class ArchitectureValidator {
  constructor() {
    this.results = {
      backendServices: false,
      apiEndpoints: false,
      frontendComponents: false,
      typeDefinitions: false,
      schemaIntegration: false,
      overallArchitecture: false
    };
    this.findings = [];
  }

  /**
   * Validate backend services exist and are properly structured
   */
  validateBackendServices() {
    console.log('🔧 Validating Backend Services...');
    
    const requiredServices = [
      'server/services/maya-service.ts',
      'server/storage.ts',
      'server/drizzle.ts',
      'shared/schema-maya.ts',
      'shared/types-override.ts'
    ];

    let servicesFound = 0;
    
    requiredServices.forEach(servicePath => {
      const fullPath = path.join(process.cwd(), servicePath);
      if (fs.existsSync(fullPath)) {
        servicesFound++;
        console.log(`✅ Found: ${servicePath}`);
      } else {
        console.log(`❌ Missing: ${servicePath}`);
      }
    });

    // Check for key service methods
    this.checkServiceMethods();

    this.results.backendServices = servicesFound >= requiredServices.length - 1; // Allow 1 missing
    this.findings.push(`Backend Services: ${servicesFound}/${requiredServices.length} found`);
  }

  /**
   * Check that key service methods exist
   */
  checkServiceMethods() {
    const mayaServicePath = path.join(process.cwd(), 'server/services/maya-service.ts');
    
    if (fs.existsSync(mayaServicePath)) {
      const content = fs.readFileSync(mayaServicePath, 'utf8');
      const requiredMethods = ['processChat', 'generateImages', 'startFluxGeneration'];
      
      requiredMethods.forEach(method => {
        if (content.includes(method)) {
          console.log(`✅ Maya Service method: ${method}`);
        } else {
          console.log(`⚠️ Missing Maya Service method: ${method}`);
        }
      });
    }
  }

  /**
   * Validate API endpoints are properly configured
   */
  validateApiEndpoints() {
    console.log('🌐 Validating API Endpoints...');
    
    const apiIndexPath = path.join(process.cwd(), 'api/index.ts');
    
    if (fs.existsSync(apiIndexPath)) {
      const content = fs.readFileSync(apiIndexPath, 'utf8');
      
      const requiredEndpoints = [
        '/api/maya-chat',
        '/api/maya-generate',
        '/api/maya-chats'
      ];

      let endpointsFound = 0;
      
      requiredEndpoints.forEach(endpoint => {
        if (content.includes(endpoint)) {
          endpointsFound++;
          console.log(`✅ Found endpoint: ${endpoint}`);
        } else {
          console.log(`❌ Missing endpoint: ${endpoint}`);
        }
      });

      this.results.apiEndpoints = endpointsFound >= requiredEndpoints.length;
      this.findings.push(`API Endpoints: ${endpointsFound}/${requiredEndpoints.length} found`);
    } else {
      console.log('❌ API index file not found');
      this.results.apiEndpoints = false;
    }
  }

  /**
   * Validate frontend components exist
   */
  validateFrontendComponents() {
    console.log('🎨 Validating Frontend Components...');
    
    const requiredComponents = [
      'client/src/contexts/BrandStudioContext.tsx',
      'client/src/components/SSELFIEChat.tsx',
      'client/src/app_v2/MayaScreen.tsx',
      'shared/types/concept-card.ts'
    ];

    let componentsFound = 0;
    
    requiredComponents.forEach(componentPath => {
      const fullPath = path.join(process.cwd(), componentPath);
      if (fs.existsSync(fullPath)) {
        componentsFound++;
        console.log(`✅ Found: ${componentPath}`);
      } else {
        console.log(`❌ Missing: ${componentPath}`);
      }
    });

    this.results.frontendComponents = componentsFound >= requiredComponents.length - 1;
    this.findings.push(`Frontend Components: ${componentsFound}/${requiredComponents.length} found`);
  }

  /**
   * Validate type definitions are comprehensive
   */
  validateTypeDefinitions() {
    console.log('📝 Validating Type Definitions...');
    
    const typeOverridePath = path.join(process.cwd(), 'shared/types-override.ts');
    
    if (fs.existsSync(typeOverridePath)) {
      const content = fs.readFileSync(typeOverridePath, 'utf8');
      
      const requiredTypes = [
        'interface User',
        'interface UserModel',
        'interface AiImage',
        'interface Conversation',
        'interface GenerationTracker',
        'interface MayaProfile'
      ];

      let typesFound = 0;
      
      requiredTypes.forEach(type => {
        if (content.includes(type)) {
          typesFound++;
          console.log(`✅ Found type: ${type}`);
        } else {
          console.log(`❌ Missing type: ${type}`);
        }
      });

      this.results.typeDefinitions = typesFound >= requiredTypes.length - 1;
      this.findings.push(`Type Definitions: ${typesFound}/${requiredTypes.length} found`);
    } else {
      console.log('❌ Type overrides file not found');
      this.results.typeDefinitions = false;
    }
  }

  /**
   * Validate schema integration
   */
  validateSchemaIntegration() {
    console.log('🗄️ Validating Schema Integration...');
    
    const mayaSchemaPath = path.join(process.cwd(), 'shared/schema-maya.ts');
    
    if (fs.existsSync(mayaSchemaPath)) {
      const content = fs.readFileSync(mayaSchemaPath, 'utf8');
      
      const requiredTables = [
        'mayaModels',
        'mayaImages',
        'mayaConcepts',
        'mayaProfile'
      ];

      let tablesFound = 0;
      
      requiredTables.forEach(table => {
        if (content.includes(table)) {
          tablesFound++;
          console.log(`✅ Found table: ${table}`);
        } else {
          console.log(`❌ Missing table: ${table}`);
        }
      });

      this.results.schemaIntegration = tablesFound >= requiredTables.length - 1;
      this.findings.push(`Schema Tables: ${tablesFound}/${requiredTables.length} found`);
    } else {
      console.log('❌ Maya schema file not found');
      this.results.schemaIntegration = false;
    }
  }

  /**
   * Validate overall architecture coherence
   */
  validateOverallArchitecture() {
    console.log('🏗️ Validating Overall Architecture...');
    
    // Check for critical integration points
    const integrationChecks = [
      this.checkServiceIntegration(),
      this.checkTypeIntegration(),
      this.checkApiIntegration(),
      this.checkFrontendIntegration()
    ];

    const passedChecks = integrationChecks.filter(check => check).length;
    this.results.overallArchitecture = passedChecks >= 3;
    this.findings.push(`Integration Checks: ${passedChecks}/4 passed`);
  }

  checkServiceIntegration() {
    // Check if MayaService imports the required dependencies
    const mayaServicePath = path.join(process.cwd(), 'server/services/maya-service.ts');
    if (!fs.existsSync(mayaServicePath)) return false;
    
    const content = fs.readFileSync(mayaServicePath, 'utf8');
    const hasStorageImport = content.includes('DatabaseStorage');
    const hasTypeImports = content.includes('types-override');
    
    if (hasStorageImport && hasTypeImports) {
      console.log('✅ Service integration: MayaService properly imports dependencies');
      return true;
    } else {
      console.log('⚠️ Service integration: Missing imports in MayaService');
      return false;
    }
  }

  checkTypeIntegration() {
    // Check if types are consistently used across the system
    const storagePath = path.join(process.cwd(), 'server/storage.ts');
    if (!fs.existsSync(storagePath)) return false;
    
    const content = fs.readFileSync(storagePath, 'utf8');
    const usesOverrideTypes = content.includes('types-override');
    
    if (usesOverrideTypes) {
      console.log('✅ Type integration: Storage uses manual type overrides');
      return true;
    } else {
      console.log('⚠️ Type integration: Storage not using type overrides');
      return false;
    }
  }

  checkApiIntegration() {
    // Check if API properly routes to services
    const apiPath = path.join(process.cwd(), 'api/index.ts');
    if (!fs.existsSync(apiPath)) return false;
    
    const content = fs.readFileSync(apiPath, 'utf8');
    const importsMayaService = content.includes('maya-service');
    
    if (importsMayaService) {
      console.log('✅ API integration: Routes properly integrated with MayaService');
      return true;
    } else {
      console.log('⚠️ API integration: Missing MayaService integration');
      return false;
    }
  }

  checkFrontendIntegration() {
    // Check if frontend components use consistent types
    const contextPath = path.join(process.cwd(), 'client/src/contexts/BrandStudioContext.tsx');
    if (!fs.existsSync(contextPath)) return false;
    
    const content = fs.readFileSync(contextPath, 'utf8');
    const usesConceptCard = content.includes('ConceptCard');
    
    if (usesConceptCard) {
      console.log('✅ Frontend integration: Components use shared types');
      return true;
    } else {
      console.log('⚠️ Frontend integration: Missing type consistency');
      return false;
    }
  }

  /**
   * Run complete architecture validation
   */
  async runValidation() {
    console.log('🏛️ VERTICAL SLICE ARCHITECTURE VALIDATION\n');
    console.log('='.repeat(60));

    const startTime = Date.now();

    // Run all validations
    this.validateBackendServices();
    console.log('');
    this.validateApiEndpoints();
    console.log('');
    this.validateFrontendComponents();
    console.log('');
    this.validateTypeDefinitions();
    console.log('');
    this.validateSchemaIntegration();
    console.log('');
    this.validateOverallArchitecture();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    this.generateReport(duration);
  }

  /**
   * Generate validation report
   */
  generateReport(duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ARCHITECTURE VALIDATION REPORT');
    console.log('='.repeat(60));

    const results = [
      { name: 'Backend Services', passed: this.results.backendServices },
      { name: 'API Endpoints', passed: this.results.apiEndpoints },
      { name: 'Frontend Components', passed: this.results.frontendComponents },
      { name: 'Type Definitions', passed: this.results.typeDefinitions },
      { name: 'Schema Integration', passed: this.results.schemaIntegration },
      { name: 'Overall Architecture', passed: this.results.overallArchitecture }
    ];

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const successRate = Math.round((passedCount / totalCount) * 100);

    console.log(`\n📈 Validation Results: ${passedCount}/${totalCount} areas validated (${successRate}%)`);
    console.log(`⏱️  Total Duration: ${duration.toFixed(2)} seconds\n`);

    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
    });

    console.log('\n📋 Detailed Findings:');
    this.findings.forEach(finding => {
      console.log(`  • ${finding}`);
    });

    // Overall assessment
    console.log('\n' + '-'.repeat(60));
    if (passedCount === totalCount) {
      console.log('🎉 ARCHITECTURE VALIDATION: COMPLETE SUCCESS');
      console.log('✨ Vertical slice architecture is properly implemented!');
      console.log('🚀 Ready for end-to-end testing and deployment');
    } else if (passedCount >= totalCount * 0.8) {
      console.log('🟡 ARCHITECTURE VALIDATION: MOSTLY SUCCESSFUL');
      console.log('🔧 Minor architecture issues detected but core structure is solid');
      console.log('📝 Address remaining issues for optimal performance');
    } else {
      console.log('🔴 ARCHITECTURE VALIDATION: NEEDS ATTENTION');
      console.log('⚠️  Significant architecture gaps detected');
      console.log('🛠️  Focus on missing components before proceeding');
    }

    console.log('\n' + '='.repeat(60));

    // Return validation result for programmatic use
    return {
      success: passedCount >= totalCount * 0.8,
      score: successRate,
      passedCount,
      totalCount,
      findings: this.findings
    };
  }
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ArchitectureValidator();
  validator.runValidation().catch(error => {
    console.error('🚨 Architecture validation crashed:', error);
    process.exit(1);
  });
}

export default ArchitectureValidator;