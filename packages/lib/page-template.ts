export default `
__IMPORTS__
import { Container } from '@/components/misc/layout/Container';


export default function Page() {
    return (
        <main className="py-8">
            __CONTENT__
        </main>
    )
}

`

export const componentTemplate = `
            <Container>
                <_COMPONENT_/>
            </Container>
`