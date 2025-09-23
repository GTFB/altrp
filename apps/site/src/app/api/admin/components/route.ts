import { AvailableBlock } from '@/types/page-editor';
import { NextRequest, NextResponse } from 'next/server';
import { ComponentRepository } from '@/repositories/component.repository';

export async function GET(request: NextRequest) {

    // const availableBlocks: AvailableBlock[] = [
    //     { type: 'text', label: 'Text', componentName: 'Text', importString: 'import {Text} from "@/components/text";' },
    // ];
    return NextResponse.json(await ComponentRepository.getInstance().fetchComponents());
}




