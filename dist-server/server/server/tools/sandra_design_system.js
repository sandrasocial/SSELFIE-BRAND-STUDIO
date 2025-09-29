export const SandraDesignSystem = {
    typography: {
        fontFamily: 'Times New Roman, serif',
        tracking: '0.4em',
    },
    colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#808080',
    },
    layout: {
        heroes: {
            type: 'full-bleed',
            width: '100vw',
        },
        sections: {
            padding: '120px',
        }
    },
    principles: {
        luxury: true,
        editorial: true,
        consistency: 'mandatory',
        deviations: 'not-allowed',
    }
};
export const designSystemVersion = '1.0.0';
export const getTypographyStyles = () => {
    return {
        fontFamily: SandraDesignSystem.typography.fontFamily,
        letterSpacing: SandraDesignSystem.typography.tracking,
    };
};
export const getLayoutStyles = () => {
    return {
        padding: SandraDesignSystem.layout.sections.padding,
    };
};
export default SandraDesignSystem;
//# sourceMappingURL=sandra_design_system.js.map