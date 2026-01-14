/**
 * Tipo genérico para componentes que recebem children
 * 
 * @description
 * Define uma interface padrão para componentes React que precisam
 * renderizar elementos filhos. Útil para componentes wrapper e layout.
 * 
 * @example
 * ```tsx
 * const Container: React.FC<Props> = ({ children }) => {
 *   return <div className="container">{children}</div>;
 * };
 * ```
 */
export type ChildrenProps = {
    /**
     * Elementos React que serão renderizados como filhos do componente
     * 
     * Pode ser qualquer elemento válido do React: componentes, elementos JSX,
     * strings, números, arrays, fragmentos, portals, etc.
     */
    children: React.ReactNode;
};