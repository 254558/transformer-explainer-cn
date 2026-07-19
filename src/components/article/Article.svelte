<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import Katex from '~/utils/Katex.svelte';
</script>

<div id="description">
	<div class="article-section" data-click="article-intro">
		<h1>什么是 Transformer？</h1>

		<p>
			Transformer 是一种彻底改变了人工智能方法的神经网络架构。它首次提出于 2017 年的开创性论文
			<a
				href="https://dl.acm.org/doi/10.5555/3295222.3295349"
				title="ACM Digital Library"
				target="_blank">"Attention is All You Need"</a
			>
			中，此后成为深度学习模型的首选架构，驱动着 OpenAI 的 <strong>GPT</strong>、Meta 的 <strong>Llama</strong> 和 Google 的
			<strong>Gemini</strong> 等文本生成模型。除了文本，Transformer 还被应用于
			<a
				href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
				title="Hugging Face"
				target="_blank">音频生成</a
			>、
			<a
				href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
				title="Hugging Face"
				target="_blank">图像识别</a
			>、
			<a href="https://elifesciences.org/articles/82819" title="eLife">蛋白质结构预测</a>，甚至
			<a
				href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
				title="Deep Learning AI"
				target="_blank">游戏博弈</a
			>，展示了其在众多领域的通用性。
		</p>
		<p>
			从根本上说，文本生成 Transformer 模型基于<strong>下一个 token 预测</strong>的原理：给定用户的文本提示，<em>最可能的下一个 token（一个词或词的一部分）</em>是什么？Transformer 的核心创新和力量在于其自注意力机制，这使得它们能够处理整个序列并比之前的架构更有效地捕捉长距离依赖关系。
		</p>
		<p>
			GPT-2 系列模型是文本生成 Transformer 的典型代表。Transformer Explainer 由
			<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
				>GPT-2</a
			>
			（小型）模型驱动，拥有 1.24 亿参数。虽然它不是最新或最强大的 Transformer 模型，但它共享了当前最先进模型的许多相同架构组件和原理，是理解基础的理想起点。
		</p>
	</div>

	<div class="article-section" data-click="article-overview">
		<h1>Transformer 架构</h1>

		<p>
			每个文本生成 Transformer 都由以下<strong>三个关键组件</strong>组成：
		</p>
		<ol>
			<li>
					<strong class="bold-purple">嵌入层</strong>：文本输入被分割成更小的单元，称为标记（可以是词或子词）。这些标记被转换为称为嵌入向量的数字向量，捕捉词语的语义含义。
			</li>
			<li>
				<strong class="bold-purple">Transformer 块</strong> 是模型处理和转换输入数据的基本构建块。每个块包括：
				<ul class="">
					<li>
						<strong>注意力机制</strong>，Transformer 块的核心组件。它允许 token 与其他 token 通信，捕捉上下文信息和词之间的关系。
					</li>
					<li>
						<strong>多层感知机层</strong>，一个前馈网络，独立处理每个标记。注意力层的目标是在标记之间路由信息，而 MLP 的目标是精炼每个标记的表示。
					</li>
				</ul>
			</li>
			<li>
				<strong class="bold-purple">输出概率</strong>：最后的线性层和 softmax 层将处理后的嵌入向量转换为概率，使模型能够预测序列中的下一个标记。
			</li>
		</ol>
	</div>

	<div class="article-section" id="embedding" data-click="article-embedding">
		<h2>嵌入层</h2>
		<p>
				假设你想用 Transformer 模型生成文本。你输入这样的提示：<code>"Data visualization empowers users to"</code>。这个输入需要被转换成模型能够理解和处理的格式。这就是嵌入的作用：它将文本转换为模型可以处理的数字表示。为了将提示转换为嵌入，我们需要：1）对输入进行分词，2）获取标记嵌入，3）添加位置信息，4）将标记和位置编码相加得到最终的嵌入。让我们看看每一步是如何完成的。
		</p>
		<div class="figure">
			<img src="./article_assets/embedding.png" width="65%" />
		</div>
		<div class="figure-caption">
				图 <span class="attention">1</span>。展开嵌入层视图，展示输入提示如何转换为向量表示。该过程包括
				<span class="fig-numbering">(1)</span> 分词、(2) 标记嵌入、(3) 位置编码和 (4) 最终嵌入。
		</div>
		<div class="article-subsection">
				<h3>步骤 1：分词</h3>
			<p>
					分词是将输入文本分解成更小、更易管理的片段（称为标记）的过程。这些标记可以是词或子词。单词 <code>"Data"</code> 和 <code>"visualization"</code> 对应唯一的标记，而 <code>"empowers"</code> 被拆分成两个标记。完整的标记词汇表在训练模型之前确定：GPT-2 的词汇表有 <code>50,257</code> 个唯一的标记。现在我们将输入文本分割成具有不同 ID 的标记，就可以从嵌入中获取它们的向量表示。
			</p>
		</div>
		<div class="article-subsection" id="article-token-embedding">
				<h3>步骤 2. 标记嵌入</h3>
			<p>
					GPT-2（小型）将词汇表中的每个标记表示为一个 768 维的向量；向量的维度取决于模型。这些嵌入向量存储在一个形状为 <code>(50,257, 768)</code> 的矩阵中，包含约 3900 万个参数！这个庞大的矩阵使模型能够为每个标记赋予语义含义，在语言中使用或含义相似的标记在这个高维空间中位置接近，而不相似的标记则相距较远。
			</p>
		</div>
		<div class="article-subsection" id="article-positional-embedding">
			<h3>步骤 3. 位置编码</h3>
			<p>
					嵌入层还会编码每个标记在输入提示中位置的信息。不同模型使用不同的位置编码方法。GPT-2 从头开始训练自己的位置编码矩阵，将其直接集成到训练过程中。
			</p>
		</div>
		<div class="article-subsection">
			<h3>步骤 4. 最终嵌入</h3>
			<p>
					最后，我们将标记编码和位置编码相加，得到最终的嵌入表示。这种组合表示既捕捉了标记的语义含义，也捕捉了它们在输入序列中的位置。
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-transformer-block">
		<h2>Transformer 块</h2>

		<p>
				Transformer 处理的核心在于 Transformer 块，它包含多头自注意力和多层感知机层。大多数模型由多个这样的块顺序堆叠而成。标记表示从第一个块到最后一个块逐层演化，使模型能够建立对每个标记的深入理解。这种分层方法导致输入的更高级别表示。我们正在查看的 GPT-2（小型）模型由 <code>12</code> 个这样的块组成。
		</p>
	</div>

	<div class="article-section" id="self-attention" data-click="article-attention">
			<h3>多头自注意力</h3>
		<p>
				自注意力机制使模型能够捕捉序列中标记之间的关系，使每个标记的表示受到其他标记的影响。多个注意力头允许模型从不同角度考虑这些关系；例如，一个头可能捕捉短程语法联系，而另一个头追踪更广泛的语义上下文。在接下来的部分中，我们将逐步介绍多头自注意力是如何计算的。
		</p>
		<div class="article-subsection-l2">
			<h4>步骤 1：查询、键和值矩阵</h4>

			<div class="figure pt-10">
				<img src="./article_assets/QKV.png" width="80%" />
				<div class="text-xs">
					<Katex
						displayMode
						math={`
		QKV_{ij} = ( \\sum_{d=1}^{768} \\text{Embedding}_{i,d} \\cdot \\text{Weights}_{d,j}) + \\text{Bias}_j
		`}
					/>
				</div>
			</div>
			<div class="figure-caption">
				图 <span class="attention">2</span>。从原始嵌入计算查询、键和值矩阵。
			</div>

			<p>
					每个标记的嵌入向量被转换为三个向量：
					<span class="q-color">查询</span>、
					<span class="k-color">键</span> 和
					<span class="v-color">值</span>。这些向量通过将输入嵌入矩阵与学习得到的
					<span class="q-color">Q</span>、<span class="k-color">K</span> 和 <span class="v-color">V</span> 的权重矩阵相乘得到。这里有一个网页搜索的类比来帮助理解这些矩阵：
			</p>
			<ul>
				<li>
						<strong class="q-color font-medium">查询</strong> 就像你在搜索引擎栏中输入的搜索文本。这是你想要<em>"查找更多信息"</em>的标记。
				</li>
				<li>
						<strong class="k-color font-medium">键</strong> 就像搜索结果窗口中每个网页的标题。它代表查询可以关注的可能的标记。
				</li>
				<li>
						<strong class="v-color font-medium">值</strong> 就像实际显示的网页内容。一旦我们将适当的搜索词与相关结果匹配，我们就想获取最相关页面的内容。
				</li>
			</ul>
			<p>
					通过使用这些 QKV 值，模型可以计算注意力分数，决定在生成预测时每个标记应该获得多少关注。
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 2：多头分割</h4>
			<p>
				<span class="q-color">查询</span>、<span class="k-color">键</span> 和 <span class="v-color">值</span> 向量被分割成多个头——在 GPT-2（小型）的情况下，分为 <code>12</code> 个头。每个头独立处理嵌入向量的一部分，捕捉不同的语法和语义关系。这种设计有助于并行学习多样化的语言特征，增强了模型的表示能力。
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 3：掩码自注意力</h4>
			<p>
				在每个头中，我们执行掩码自注意力计算。这种机制允许模型通过关注输入的相关部分来生成序列，同时防止访问未来的 token。
			</p>

			<div class="figure">
				<img src="./article_assets/attention.png" width="80%" align="middle" />
			</div>
			<div class="figure-caption">
				图 <span class="attention">3</span>。使用查询、键和值矩阵计算掩码自注意力。
			</div>

			<ul>
				<li>
						<strong>点积</strong>：<span class="q-color">查询</span> 和 <span class="k-color">键</span> 矩阵的点积确定<strong>注意力分数</strong>，产生一个反映所有输入标记之间关系的方阵。
				</li>
				<li>
						<strong>缩放 · 掩码</strong>：注意力分数被缩放，并在注意力矩阵的上三角应用掩码以防止模型访问未来的标记，将这些值设置为负无穷。模型需要学会如何预测下一个标记，而不能"窥视"未来。
				</li>
				<li>
						<strong>Softmax · 丢弃</strong>：掩码和缩放后，注意力分数通过 softmax 操作转换为概率，然后可选地通过 dropout 进行正则化。矩阵的每一行之和为 1，表示每个标记对左侧所有其他标记的相关性。
				</li>
			</ul>
		</div>
		<div class="article-subsection-l2">
			<h4>步骤 4：输出和拼接</h4>
			<p>
				模型使用掩码自注意力分数与 <span class="v-color">值</span> 矩阵相乘，得到自注意力机制的<span class="purple-color">最终输出</span>。GPT-2 有 <code>12</code> 个自注意力头，每个捕捉标记之间的不同关系。这些头的输出被拼接起来并通过一个线性投影。
			</p>
		</div>
	</div>

	<div class="article-section" id="article-activation" data-click="article-mlp">
			<h3>多层感知机</h3>

		<div class="figure">
			<img src="./article_assets/mlp.png" width="70%" align="middle" />
		</div>
		<div class="figure-caption">
			图 <span class="attention">4</span>。使用 MLP 层将自注意力表示投影到更高维度，以增强模型的表示能力。
		</div>

		<p>
				在多个自注意力头捕捉了输入标记之间的多样化关系后，拼接的输出通过多层感知机（MLP）层以增强模型的表示能力。MLP 块由两个线性变换和一个中间的
			<a href="https://en.wikipedia.org/wiki/Rectified_linear_unit#Gaussian-error_linear_unit_(GELU)">GELU</a> 激活函数组成。
		</p>
		<p>
				第一个线性变换将输入的维度扩展四倍，从 <code>768</code> 到 <code>3072</code>。这个扩展步骤允许模型将标记表示投影到更高维的空间，在那里它可以捕捉在原始维度中可能不可见的更丰富和更复杂的模式。
		</p>
		<p>
			第二个线性变换然后将维度降低回原始大小 <code>768</code>。这个压缩步骤将表示带回可管理的大小，同时保留扩展步骤中引入的有用的非线性变换。
		</p>
		<p>
				与跨标记整合信息的自注意力机制不同，MLP 独立处理每个标记，简单地将每个标记表示从一个空间映射到另一个空间，丰富了整体模型的能力。
		</p>
	</div>

	<div class="article-section" id="article-prob" data-click="article-prob">
		<h2>输出概率</h2>
		<p>
				在输入通过所有 Transformer 块处理后，输出通过最后的线性层为标记预测做准备。这一层将最终表示投影到 <code>50,257</code> 维空间，词汇表中的每个标记都有一个对应的值，称为 <code>logit</code>。任何标记都可能是下一个词，所以这个过程允许我们简单地根据标记成为下一个词的可能性进行排序。然后我们应用 softmax 函数将 logits 转换为总和为 1 的概率分布。这将使我们能够根据可能性对下一个标记进行采样。
		</p>

		<div class="figure py-5">
			<img src="./article_assets/softmax.png" width="70%" />
		</div>
		<div class="figure-caption">
				图 <span class="attention">5</span>。词汇表中的每个标记根据模型的输出 logits 被赋予一个概率。这些概率决定了每个标记成为序列中下一个词的可能性。
		</div>

		<p id="article-temperature" data-click="article-temperature">
				最后一步是通过从这个分布中采样来生成下一个标记。<code>温度</code> 超参数在这个过程中起着关键作用。从数学上讲，这是一个非常简单的操作：模型输出的 logits 只需除以 <code>温度</code>：
		</p>

		<ul>
			<li>
				<code>temperature = 1</code>：logits 除以 1 对 softmax 输出没有影响。
			</li>
			<li>
				<code>temperature &lt; 1</code>：较低的温度通过锐化概率分布使模型更自信和确定，导致更可预测的输出。
			</li>
			<li>
				<code>temperature &gt; 1</code>：较高的温度创建更平滑的概率分布，允许生成文本中有更多的随机性——有些人称之为模型的<em>"创造力"</em>。
			</li>
		</ul>

		<p id="article-sampling" data-click="article-sampling">
			此外，采样过程可以使用 <code>top-k</code> 和 <code>top-p</code> 参数进一步优化：
		</p>
		<ul>
			<li>
				<code>top-k 采样</code>：将候选 token 限制为概率最高的前 k 个 token，过滤掉不太可能的选项。
			</li>
			<li>
				<code>top-p 采样</code>：考虑累计概率超过阈值 p 的最小 token 集合，确保只有最可能的 token 贡献，同时仍然允许多样性。
			</li>
		</ul>
		<p>
			通过调整 <code>temperature</code>、<code>top-k</code> 和 <code>top-p</code>，你可以在确定性和多样化的输出之间取得平衡，根据你的特定需求定制模型的行为。
		</p>
	</div>

	<div class="article-section" data-click="article-advanced-features">
		<h2>辅助架构特性</h2>

		<p>
			有几个辅助架构特性增强了 Transformer 模型的性能。虽然它们对模型的整体性能很重要，但对于理解架构的核心概念并不是那么关键。层归一化、丢弃和残差连接是 Transformer 模型中的关键组件，特别是在训练阶段。层归一化稳定训练过程，帮助模型更快收敛。丢弃通过随机停用神经元来防止过拟合。残差连接允许梯度直接通过网络流动，有助于防止梯度消失问题。
		</p>
		<div class="article-subsection" id="article-ln">
				<h3>层归一化</h3>

			<p>
				层归一化有助于稳定训练过程并改善收敛性。它通过对特征维度上的输入进行归一化，确保激活值的均值和方差保持一致。这种归一化有助于缓解内部协变量偏移相关的问题，使模型更有效地学习并减少对初始权重的敏感度。层归一化在每个 Transformer 块中应用两次：一次在自注意力机制之前，一次在 MLP 层之前。
			</p>
		</div>
		<div class="article-subsection" id="article-dropout">
				<h3>丢弃</h3>

			<p>
				丢弃是一种正则化技术，通过在训练期间随机将一部分模型权重设置为零来防止神经网络过拟合。这鼓励模型学习更鲁棒的特征，减少对特定神经元的依赖，帮助网络更好地泛化到新的、未见过的数据。在模型推理期间，丢弃被停用。这实质上意味着我们使用了训练好的子网络的集成，从而带来更好的模型性能。
			</p>
		</div>
		<div class="article-subsection" id="article-residual">
				<h3>残差连接</h3>

			<p>
				残差连接首次在 2015 年的 ResNet 模型中提出。这一架构创新通过使训练非常深的神经网络成为可能，彻底改变了深度学习。本质上，残差连接是跳过一个或多个层的捷径，将层的输入添加到其输出中。这有助于缓解梯度消失问题，使得训练具有多个堆叠 Transformer 块的深层网络更加容易。在 GPT-2 中，每个 Transformer 块内使用两次残差连接：一次在 MLP 之前，一次在 MLP 之后，确保梯度更容易流动，并且较早的层在反向传播期间获得足够的更新。
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-interactive-features">
		<h1>交互功能</h1>
		<p>
			Transformer Explainer 设计为交互式，允许你探索 Transformer 的内部工作原理。以下是一些你可以尝试的交互功能：
		</p>

		<ul>
			<li>
				<strong>输入你自己的文本序列</strong>，观察模型如何处理它并预测下一个词。探索注意力权重、中间计算，看看最终输出概率是如何计算的。
			</li>
			<li>
				<strong>使用温度滑块</strong>来控制模型预测的随机性。探索如何通过改变温度值使模型输出更确定或更有创意。
			</li>
			<li>
				<strong>选择 top-k 和 top-p 采样方法</strong>来调整推理期间的采样行为。尝试不同的值，观察概率分布如何变化以及如何影响模型的预测。
			</li>
			<li>
					<strong>与注意力图交互</strong>，观察模型如何关注输入序列中的不同标记。悬停在标记上以高亮其注意力权重，探索模型如何捕捉上下文和词之间的关系。
			</li>
		</ul>
	</div>

	<div class="article-section" data-click="article-video">
		<h2>视频教程</h2>
		<div class="video-container">
			<iframe
				src="https://www.youtube.com/embed/ECR4oAwocjs"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			>
			</iframe>
		</div>
	</div>

	<div class="article-section" data-click="article-implementation">
		<h2>Transformer Explainer 是如何实现的？</h2>
		<p>
			Transformer Explainer 直接在浏览器中运行一个实时的 GPT-2（小型）模型。该模型源自 Andrej Karpathy 的
			<a href="https://github.com/karpathy/nanoGPT" title="Github" target="_blank">nanoGPT 项目</a>
			的 PyTorch 实现，并已转换为
			<a href="https://onnxruntime.ai/" title="ONNX" target="_blank">ONNX Runtime</a>
			格式以在浏览器中无缝执行。界面使用 JavaScript 构建，采用
			<a href="https://kit.svelte.dev/" title="Svelte" target="_blank">Svelte</a>
			作为前端框架，
			<a href="https://d3js.org/" title="D3" target="_blank">D3.js</a>
			用于创建动态可视化。数值会随着用户输入实时更新。
		</p>
	</div>

	<div class="article-section" data-click="article-credit">
		<h2>Transformer Explainer 是谁开发的？</h2>
		<p>
			Transformer Explainer 由佐治亚理工学院的

			<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>、
			<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>、
			<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>、
			<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>、
			<a href="https://zijie.wang/" target="_blank">Jay Wang</a>、
			<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>、
			<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a> 和
			<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>

			共同开发。
		</p>
	</div>
</div>

<style lang="scss">
	a {
		color: theme('colors.blue.500');

		&:hover {
			color: theme('colors.blue.700');
		}
	}

	.bold-purple {
		color: theme('colors.purple.700');
		font-weight: bold;
	}

	code {
		color: theme('colors.gray.500');
		background-color: theme('colors.gray.50');
		font-family: theme('fontFamily.mono');
	}

	.q-color {
		color: theme('colors.blue.400');
	}

	.k-color {
		color: theme('colors.red.400');
	}

	.v-color {
		color: theme('colors.green.400');
	}

	.purple-color {
		color: theme('colors.purple.500');
	}

	.article-section {
		padding-bottom: 2rem;
	}
	.architecture-section {
		padding-top: 1rem;
	}
	.video-container {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		height: 0;
		overflow: hidden;
		max-width: 100%;
		background: #000;
	}

	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	#description {
		padding-bottom: 3rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 78ch;
	}

	#description h1 {
		color: theme('colors.purple.700');
		font-size: 2.2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h2 {
		// color: #444;
		color: theme('colors.purple.700');
		font-size: 2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h3 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description h4 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description p {
		margin: 1rem 0;
	}

	#description p img {
		vertical-align: middle;
	}

	#description .figure-caption {
		font-size: 0.8rem;
		margin-top: 0.5rem;
		text-align: center;
		margin-bottom: 2rem;
	}

	#description ol {
		margin-left: 3rem;
		list-style-type: decimal;
	}

	#description li {
		margin: 0.6rem 0;
	}

	#description p,
	#description div,
	#description li {
		color: theme('colors.gray.600');
		line-height: 1.6;
	}

	#description small {
		font-size: 0.8rem;
	}

	#description ol li img {
		vertical-align: middle;
	}

	#description .video-link {
		color: theme('colors.blue.600');
		cursor: pointer;
		font-weight: normal;
		text-decoration: none;
	}

	#description ul {
		list-style-type: disc;
		margin-left: 2.5rem;
		margin-bottom: 1rem;
	}

	#description a:hover,
	#description .video-link:hover {
		text-decoration: underline;
	}

	.figure,
	.video {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
