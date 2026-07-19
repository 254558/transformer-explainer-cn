import { get } from 'svelte/store';
import {
	expandedBlock,
	weightPopover,
	isBoundingBoxActive,
	textbookCurrentPageId,
	isExpandOrCollapseRunning,
	isFetchingModel,
	userId
} from '~/store';
import {
	highlightElements,
	removeHighlightFromElements,
	applyTransformerBoundingHeight,
	resetElementsHeight,
	highlightAttentionPath,
	removeAttentionPathHighlight,
	removeFingerFromElements
} from '~/utils/textbook';
import { drawResidualLine } from './animation';

export interface TextbookPage {
	id: string;
	title: string;
	content?: string;
	component?: any;
	timeoutId?: number;
	on: () => void;
	out: () => void;
	complete?: () => void;
}

const { drawLine, removeLine } = drawResidualLine();

export const textPages: TextbookPage[] = [
	{
		id: 'what-is-transformer',
		title: '什么是 Transformer？',
		content: `<p><strong>Transformer</strong> 是驱动 ChatGPT 和 Gemini 等现代 AI 的核心架构。自 2017 年问世以来，它彻底改变了 AI 处理信息的方式。同一架构既用于大规模数据集训练，也用于推理生成输出。这里我们使用 GPT-2（小型），虽然比新模型简单，但非常适合学习基本原理。</p>
`,
		on: () => {},
		out: () => {}
	},
	{
		id: 'how-transformers-work',
		title: 'Transformer 如何工作？',
		content: `<p>Transformer 并不神秘——它们通过不断提问来逐词构建文本：</p>
		<blockquote class="question">
			"给定当前输入，下一个最可能出现的词是什么？"
		</blockquote>
		<p>这里我们将探索一个已训练模型如何生成文本。输入你自己的文本或使用示例，然后点击<strong>生成</strong>来观察实际运行。如果模型尚未加载完成，可以先试试其他<strong>示例</strong>。</p>`,
		on: () => {
			highlightElements(['.input-form']);
			if (get(isFetchingModel)) {
				highlightElements(['.input-form .select-button']);
			} else {
				highlightElements(['.input-form .generate-button']);
			}
		},
		out: () => {
			removeHighlightFromElements([
				'.input-form',
				'.input-form .select-button',
				'.input-form .generate-button'
			]);
		},
		complete: () => {
			removeFingerFromElements(['.input-form .select-button', '.input-form .generate-button']);
			if (get(textbookCurrentPageId) === 'how-transformers-work') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'how-transformers-work'
				});
			}
		}
	},
	{
		id: 'transformer-architecture',
		title: 'Transformer 架构',
		content:
			'<p>Transformer 由三个主要部分组成：</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>嵌入层</strong> 将文本转换为数字。</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer 块</strong> 通过自注意力机制混合信息，并用 MLP 进行精炼。</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>概率输出</strong> 确定每个下一个标记的可能性。</div></div></div>',
		on: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			highlightElements(selectors);
			applyTransformerBoundingHeight(['.softmax-bounding', '.embedding-bounding']);
		},
		out: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			removeHighlightFromElements(selectors);
			resetElementsHeight(['.softmax-bounding', '.embedding-bounding']);
		}
	},
	{
		id: 'embedding',
			title: '嵌入层',
		content: `<p>在 Transformer 处理文本之前，它首先将文本分解为小单元，并将每个单元表示为一个数字列表（向量）。这个过程称为<strong>嵌入</strong>，该术语既可以指这个过程，也可以指生成的向量本身。</p><p>在本工具中，每个向量显示为一个矩形，悬停在其上可以查看其大小。</p>`,
		on: () => {
			highlightElements(['.step.embedding .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.embedding .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.embedding .title']);
			if (get(textbookCurrentPageId) === 'embedding') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'embedding'
				});
			}
		}
	},
	{
		id: 'token-embedding',
			title: '标记嵌入',
			content: `<p><strong>分词</strong> 将输入文本分割成标记——单词或单词片段等小单元。GPT-2（小型）有 50,257 个标记的词汇表，每个都有唯一的 ID。</p><p>在<strong>标记嵌入</strong>步骤中，每个标记从一个大型查找表中匹配到一个 768 维的向量。这些向量在训练过程中学习，以最佳方式表示每个标记的含义。</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'positional-encoding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'positional-encoding',
		title: '位置编码',
			content: `<p>词序在语言中非常重要。<strong>位置编码</strong> 为每个标记提供其在序列中位置的信息。</p><p>GPT-2 通过向标记的嵌入向量添加一个学习得到的位置嵌入来实现，但较新的模型可能使用其他方法，如 RoPE（旋转位置编码），它通过旋转某些向量来编码位置。所有方法的目的都是帮助模型理解文本中的顺序。</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'token-embedding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'blocks',
		title: '重复的 Transformer 块',
			content: `<p><strong>Transformer 块</strong> 是模型中的主要处理单元。它包含两个部分：</p><ul><li><strong>多头自注意力</strong> – 让标记之间共享信息</li><li><strong>MLP</strong> – 精炼每个标记的细节</li></ul><p>模型堆叠多个这样的块，使得标记表示在传递过程中越来越丰富。GPT-2（小型）有 12 个这样的块。</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements([
						'.transformer-bounding',
						'.step.transformer-blocks .guide',
						'.attention > .title',
						'.mlp > .title'
					]);
					highlightElements(['.transformer-bounding-title'], 'textbook-button-highlight');
					isBoundingBoxActive.set(true);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.transformer-bounding',
				'.step.transformer-blocks .guide',
				'.attention > .title',
				'.mlp > .title'
			]);
			removeHighlightFromElements(['.transformer-bounding-title'], 'textbook-button-highlight');
			isBoundingBoxActive.set(false);
		},
		complete: () => {
			removeFingerFromElements(['.transformer-bounding-title']);
			if (get(textbookCurrentPageId) === 'blocks') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'blocks'
				});
			}
		}
	},
	{
		id: 'self-attention',
		title: '多头自注意力',
		content:
			'<p><strong>自注意力</strong> 让模型决定输入的哪些部分与每个标记最相关。这有助于捕捉含义和关系，即使是相距很远的词之间也能建立联系。</p><p>在<strong>多头</strong>形式中，模型并行运行多个注意力过程，每个过程关注文本中不同的模式。</p>',
		on: () => {
			highlightElements(['.step.attention']);
		},
		out: () => {
			removeHighlightFromElements(['.step.attention']);
		}
	},
	{
		id: 'qkv',
			title: '查询、键、值',
		content: `
			<p>为了执行自注意力，每个标记的嵌入向量被转换为
		  <span class="highlight">三种新的嵌入向量</span>——
		  <span class="blue">查询</span>,
		  <span class="red">键</span> 和
		  <span class="green">值</span>。
		  这个转换通过对每个标记嵌入应用不同的权重和偏置来实现。这些参数（权重和偏置）通过训练进行优化。</p>
	
		<p>生成之后，<span class="blue">查询</span> 与 <span class="red">键</span> 进行比较以衡量相关性，然后使用这个相关性对 <span class="green">值</span> 进行加权。</p>
	`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.step.qkv .qkv-column']);
			if (get(textbookCurrentPageId) === 'qkv') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'qkv'
				});
			}
		}
	},

	{
		id: 'multi-head',
		title: '多头机制',
		content:
			'<p>生成 <span class="blue">Q</span>、<span class="red">K</span> 和 <span class="green">V</span> 嵌入向量后，模型将它们分成多个<strong>头</strong>（GPT-2 小型有 12 个）。每个头处理自己较小的 <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span> 集合，关注文本中不同的模式——如语法、含义或长距离关联。</p><p>多头机制让模型能够并行学习多种关系，使其理解更加丰富。</p>',
		on: () => {
			highlightAttentionPath();
			highlightElements(['.multi-head .head-title']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.multi-head .head-title']);
		},
		complete: () => {
			removeFingerFromElements(['.multi-head .head-title']);
			if (get(textbookCurrentPageId) === 'multi-head') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'multi-head'
				});
			}
		}
	},
	{
		id: 'masked-self-attention',
		title: '掩码自注意力',
			content: `<p>在每个头中，模型决定每个标记对其他标记的关注程度：</p><ul><li><strong>点积</strong> – 将 <span class="blue">查询</span>/<span class="red">键</span> 向量中对应的数字相乘并求和，得到 <span class="purple">注意力分数</span>。</li><li><strong>掩码</strong> – 隐藏未来的标记，使其无法提前偷看。</li><li><strong>Softmax</strong> – 将分数转换为概率，每行之和为 1，显示对前面标记的关注程度。</li></ul>`,
		on: () => {
			highlightAttentionPath();
			highlightElements(['.attention-matrix.attention-result']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.attention-matrix.attention-result']);
			expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.attention-matrix.attention-result']);
			if (get(textbookCurrentPageId) === 'masked-self-attention') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'masked-self-attention'
				});
			}
		}
	},
	{
		id: 'output-concatenation',
		title: '注意力输出与拼接',
		content:
			'<p>每个头将它的<span class="purple">注意力分数</span>与<span class="green">值</span>嵌入向量<span class="highlight">相乘，生成注意力输出</span>——这是在考虑上下文后每个标记的精炼表示。</p><p>GPT-2（小型）有 12 个这样的输出，它们被拼接起来形成一个原始大小的向量（768 个数字）。</p>',
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.attention .column.out']);
			if (get(textbookCurrentPageId) === 'output-concatenation') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-concatenation'
				});
			}
		}
	},
	{
		id: 'mlp',
			title: '多层感知机',
			content:
				'<p>注意力输出通过<strong>MLP</strong>来进一步精炼标记表示。线性层使用学习得到的权重和偏置改变嵌入向量的值和大小，然后通过非线性激活函数决定每个值通过多少。</p><p>存在多种激活函数；GPT-2 使用<strong>GELU</strong>，它允许小值部分通过、大值全部通过，有助于捕捉微妙和强烈的模式。</p>',
		on: () => {
			highlightElements(['.step.mlp', '.operation-col.activation']);
		},
		out: () => {
			removeHighlightFromElements(['.step.mlp', '.operation-col.activation']);
		}
	},

	{
		id: 'output-logit',
		title: '输出 Logit',
			content: `<p>经过所有 Transformer 块之后，最后一个标记的输出嵌入向量（已包含之前所有标记的上下文信息）与最后一层学习得到的权重相乘。</p><p>这产生了<strong>logits</strong>——50,257 个数字，每个对应 GPT-2 词汇表中的一个标记，表示每个标记作为下一个词出现的可能性。</p>`,
		on: () => {
			highlightElements(['g.path-group.softmax', '.column.final']);
		},
		out: () => {
			removeHighlightFromElements(['g.path-group.softmax', '.column.final']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.column.final']);
			if (get(textbookCurrentPageId) === 'output-logit') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-logit'
				});
			}
		}
	},
	{
		id: 'output-probabilities',
		title: '概率输出',
		content:
			'<p>Logits 只是原始分数。为了便于解释，我们将它们转换为 0 到 1 之间的<strong>概率</strong>，所有概率之和为 1。这告诉我们每个标记成为下一个词的可能性。</p><p>我们并不总是选择概率最高的标记，而是可以使用不同的选择策略来平衡生成文本的安全性和创造性。</p>',
		on: () => {
			highlightElements(['.step.softmax .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.softmax .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.softmax .title']);
			if (get(textbookCurrentPageId) === 'output-probabilities') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-probabilities'
				});
			}
		}
	},
	{
		id: 'temperature',
			title: '温度',
		content:
			'<p><strong>温度</strong> 通过在转换为概率之前缩放 logits 来起作用。<strong>低温度</strong>（如 0.2）使大的 logits 更大、小的更小，偏向得分最高的标记，导致更<strong>可预测的选择</strong>。<strong>高温度</strong>（如 1.0 或以上）则缩小差异，使不太可能出现的标记更具竞争力，从而产生更<strong>有创意的输出</strong>。</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.scaled',
						'.title-box.scaled',
						'.content-box.scaled',
						'.temperature-input'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.scaled',
					'.title-box.scaled',
					'.content-box.scaled',
					'.temperature-input'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.scaled',
				'.title-box.scaled',
				'.temperature-input',
				'.content-box.scaled'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.temperature-input']);
			if (get(textbookCurrentPageId) === 'temperature') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'temperature'
				});
			}
		}
	},
	{
		id: 'sampling',
		title: '采样策略',
		content:
			'<p>最后，我们需要一个策略来选择下一个标记。有多种方法，以下是常见的几种：贪心搜索选择概率最高的一个。<strong>Top-k</strong> 只保留 k 个最可能的标记，而 <strong>top-p</strong> 保留累计概率至少为 p 的最小集合——提前剔除不太可能的标记。</p><p>然后 softmax 将剩余的 logits 转换为概率，再从允许的集合中随机选择一个标记。</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.sampling',
						'.title-box.sampling',
						'.sampling-input',
						'.content-box.sampling'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.sampling',
					'.title-box.sampling',
					'.sampling-input',
					'.content-box.sampling'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.sampling',
				'.title-box.sampling',
				'.sampling-input',
				'.content-box.sampling'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.sampling-input']);
			if (get(textbookCurrentPageId) === 'sampling') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'sampling'
				});
			}
		}
	},
	{
		id: 'residual',
		title: '残差连接',
		content: `<p>Transformer 具有一些增强模型性能的辅助特性。例如，<strong>残差连接</strong>将层的输入与输出相加，防止信息在多个块中逐渐消失。在 GPT-2 中，每个块中使用两次残差连接，以有效训练更深的堆叠结构。</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['.operation-col.residual', '.residual-start']);
					drawLine();
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['.operation-col.residual', '.residual-start']);
			removeLine();
		}
	},
	{
		id: 'layer-normalization',
		title: '层归一化',
		content: `<p><strong>层归一化</strong>通过调整输入数字使其均值和方差保持一致，从而稳定训练和推理过程。这使得模型对初始权重不那么敏感，有助于更有效地学习。在 GPT-2 中，它在自注意力之前、MLP 之前以及最终输出之前各应用一次。</p>`,
		on: () => {
			highlightElements(['.operation-col.ln']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.ln']);
		}
	},
	{
		id: 'dropout',
			title: '丢弃',
		content: `<p>在训练过程中，<strong>丢弃</strong> 会随机关闭一些连接，防止模型过度拟合特定模式。这有助于模型学习更具泛化能力的特征。GPT-2 使用了丢弃，但较新的 LLM 通常省略它，因为它们在超大规模数据集上训练，过拟合问题不那么严重。在推理时，丢弃会被关闭。</p>`,
		on: () => {
			highlightElements(['.operation-col.dropout']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.dropout']);
		}
	}
];
