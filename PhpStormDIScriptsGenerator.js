const fs = require('fs');
const engine = require('php-parser');
const colors = require('colors');

// initialize a new parser instance
const parser = new engine({
    // some options :
    parser: {
        extractDoc: true,
        php7: true
    },
    ast: {
        withPositions: true
    }
});

// initialize colors API
colors.setTheme({
    success: 'green'
});

const SERVICE_METHOD_NAME_REGEX = /^get(\w+)Service$/gi;
const DI_TARGET_CLASS = [
        'Gh_Controller_Action',
        'Gh_Service_Abstract',
        'Gh_SP_Abstract',
        'Gh\\Document\\Subscriber\\AbstractEventSubscriber',
        'Gh\\Document\\Listener\\AbstractListener'
    ];
const DI_CONTAINER_FILE_PATH = '/Users/gethired/Desktop/GetHired/src/library/Gh/DependencyInjectionContainer.php';
const PHPSTORM_META_FILE_PATH = '/Users/gethired/Desktop/GetHired/.phpstorm.meta.php/gh_services.meta.php';

class PhpStormDIScriptsGenerator {

    extractFromArrayByKind(data, kind, keepAll) {
        let result = keepAll ? [] : null;
        data.map(item => {
            if (item.kind === kind) {
                if (keepAll) {
                    result.push(item);
                } else {
                    result = item;
                }
            }
        });
        return result;
    }

    getResponseServiceClassFromStatement(statement, statementType) {
        if (statementType === 'assign') {
            if (statement.expression.right.kind === 'call') {
                const targetArgument = this.extractFromArrayByKind(statement.expression.right.arguments, 'string');
                if (targetArgument) {
                    return targetArgument.value;
                }
            } else {
                return null;
            }
        } else if (statementType === 'return') {
            const targetArgument = this.extractFromArrayByKind(statement.expr.arguments || [], 'string');
            if (targetArgument) {
                return targetArgument.value;
            }
        } else {
            return null;
        }
    }

    getServiceMethodTargetNameAndResponseServiceClass(method) {
        const methodNameExecResult = SERVICE_METHOD_NAME_REGEX.exec(method.name.name);
        if (methodNameExecResult) {
            const targetName = methodNameExecResult[1];
            const expressionStatement = this.extractFromArrayByKind(method.body.children, 'expressionstatement');
            const returnStatement = this.extractFromArrayByKind(method.body.children, 'return');
            if (expressionStatement && expressionStatement.expression && expressionStatement.expression.kind === 'assign') {
                const className = this.getResponseServiceClassFromStatement(expressionStatement, 'assign');
                if (className) {
                    return {
                        targetName,
                        className
                    };
                }
            } else if (returnStatement) {
                const className = this.getResponseServiceClassFromStatement(returnStatement, 'return');
                if (className) {
                    return {
                        targetName,
                        className
                    };
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    generatePhpStormMetaMapContent(serviceMethodMappings) {
        return serviceMethodMappings
            .sort((map1, map2) => {
                return map1.targetName.localeCompare(map2.targetName);
            })
            .map((mapping) => {
                if (mapping.className.includes('Gh')) {
                    return `"${mapping.targetName.toLowerCase()}" => \\${mapping.className}::class,`;
                } else {
                    return ''
                }
            })
            .filter(Boolean);
    }

    generatePhpStormMetaFileContentFromMapContent(mapContent) {
        let fileContent = 
        '<?php \n' + 
        '\n' + 
        'namespace PHPSTORM_META {\n';

        fileContent += DI_TARGET_CLASS.map((diTargetClass) => (
            '\toverride(\n' + 
                `\t\t(new \\${diTargetClass})->service(0),\n` + 
                '\t\tmap([\n\t\t\t' + 
                    mapContent.join('\n\t\t\t') + 
                '\n\t\t])\n' + 
            '\t);\n'
        )).join('');

        fileContent += '}';

        return fileContent;
    }

    writeFileContentToPhpStormMetaFile(fileContent) {
        fs.writeFileSync(PHPSTORM_META_FILE_PATH, fileContent);
        console.log('Overwrite "gh_services.meta.php" success!🚀'.bold.success);
    }

    extractServiceMethods(originalMethods) {
        const serviceMethodMappings = [];
        originalMethods.map((codeMethod) => {
            if (codeMethod.name.name.match(this.serviceMethodNameRegex)) {
                const processedMethodResult = this.getServiceMethodTargetNameAndResponseServiceClass(codeMethod);
                if (processedMethodResult) {
                    serviceMethodMappings.push(processedMethodResult);
                }
            }
        });

        const mapContent = this.generatePhpStormMetaMapContent(serviceMethodMappings);
        const fileContent = this.generatePhpStormMetaFileContentFromMapContent(mapContent);
        this.writeFileContentToPhpStormMetaFile(fileContent);
    }

    run() {
        const diFile = fs.readFileSync(DI_CONTAINER_FILE_PATH);
        const codeContent = parser.parseCode(diFile);
        const codeClass = this.extractFromArrayByKind(codeContent.children, 'class');
        const codeMethods = this.extractFromArrayByKind(codeClass.body, 'method', true);

        this.extractServiceMethods(codeMethods);
    }
}

(new PhpStormDIScriptsGenerator()).run();