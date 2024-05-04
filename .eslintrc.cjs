module.exports = {
    extends: [
        "next/core-web-vitals",
        "airbnb",
        "airbnb/hooks",
        "airbnb-typescript",
        "prettier",
    ],
    plugins: ["prettier"],
    parserOptions: {
        project: "./tsconfig.json",
    },
    rules: {
        "prettier/prettier": [
            "error",
            {
                tabWidth: 2,
            },
        ],
        "react/react-in-jsx-scope": "off",
        "react/require-default-props": [2, { functions: "defaultArguments" }],
    },
};
